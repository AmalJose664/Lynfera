import { Types } from "mongoose";
import { RunTaskCommand } from "@aws-sdk/client-ecs";
import { _Object, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { spawn } from "child_process";
import { generateSlug } from "random-word-slugs";

import { IDeploymentService } from "@/interfaces/service/IDeploymentService.js";
import { IDeploymentRepository } from "@/interfaces/repository/IDeploymentRepository.js";
import { IProjectRepository } from "@/interfaces/repository/IProjectRepository.js";
import { IUserSerivce } from "@/interfaces/service/IUserService.js";
import { IRedisCache } from "@/interfaces/cache/IRedisCache.js";
import { ILogsService } from "@/interfaces/service/ILogsService.js";
import { DeploymentStatus, IDeployment } from "@/models/Deployment.js";
import AppError from "@/utils/AppError.js";
import { IProject, ProjectStatus } from "@/models/Projects.js";
import { nanoid } from "@/utils/generateNanoid.js";
import { DEPLOYMENT_ID_LENGTH } from "@/constants/subdomain.js";
import { QueryDeploymentDTO } from "@/dtos/deployment.dto.js";
import { deploymentBasicFields } from "@/constants/populates/deployment.populate.js";
import getNessesaryEnvs from "@/utils/getNessesaryEnvs.js";
import { dispatchBuild } from "@/utils/dispatchBuild.js";
import { config, ecsClient, s3Client } from "@/config/cloud.config.js";
import { ENVS } from "@/config/env.config.js";
import { S3_OUTPUTS_DIR } from "@/constants/paths.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { DEPLOYMENT_ERRORS, PROJECT_ERRORS, USER_ERRORS } from "@/constants/errors.js";
import { PLANS } from "@/constants/plan.js";
import { IUser } from "@/models/User.js";

class DeploymentService implements IDeploymentService {
	private deploymentRepository: IDeploymentRepository;
	private projectRepository: IProjectRepository;
	private userService: IUserSerivce;
	private MAX_CONCURRENT_RUNNABLE_DPYMNTS = 20;
	private DEPLOYMENTS_SET_KEY = "deployments:running";
	private redisCache: IRedisCache;
	private logsService: ILogsService;

	private USER_CONCURRENCY_KEY_PREFIX = "build:cncrncy"
	private USER_CONCURRENCY_TTL_SECONDS = 60 * 10

	constructor(
		deploymentRepo: IDeploymentRepository,
		projectRepo: IProjectRepository,
		userService: IUserSerivce,
		logsService: ILogsService,
		redisCache: IRedisCache,
	) {
		this.deploymentRepository = deploymentRepo;
		this.projectRepository = projectRepo;
		this.userService = userService;
		this.logsService = logsService;
		this.redisCache = redisCache;
	}
	async newDeployment(deploymentData: Partial<IDeployment>, userId: string, projectId: string): Promise<IDeployment | null> {
		const canDeploy = await this.userService.userCanDeploy(userId);
		if (!canDeploy.user) {
			throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		if (!canDeploy.allowed) {
			throw new AppError(DEPLOYMENT_ERRORS.DAILY_DEPLOYMENT_LIMIT, STATUS_CODES.TOO_MANY_REQUESTS);
		}

		const correspondindProject = await this.projectRepository.findProject(projectId, userId);
		if (!correspondindProject) {
			throw new AppError(PROJECT_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		if (correspondindProject.status === ProjectStatus.BUILDING) {
			throw new AppError(PROJECT_ERRORS.PROJECT_IN_PROGRESS, STATUS_CODES.CONFLICT);
		}
		if (correspondindProject.status === ProjectStatus.QUEUED) {
			throw new AppError(PROJECT_ERRORS.PROJECT_IN_PROGRESS, STATUS_CODES.CONFLICT);
		}
		if (correspondindProject.isDeleted) {
			throw new AppError(PROJECT_ERRORS.NOT_FOUND, 404);
		}

		deploymentData.status = DeploymentStatus.QUEUED;
		deploymentData.overWrite = false;
		deploymentData.commit_hash = "------||------";
		deploymentData.publicId = nanoid(DEPLOYMENT_ID_LENGTH);
		deploymentData.identifierSlug = generateSlug(3);
		deploymentData.project = new Types.ObjectId(correspondindProject._id);
		deploymentData.user = correspondindProject.user;
		await this.incrementRunningDeplymnts(correspondindProject._id, canDeploy.user._id, canDeploy.user.plan);

		try {
			const deployment = await this.deploymentRepository.createDeployment(deploymentData);

			await Promise.all([
				this.projectRepository.pushToDeployments(correspondindProject.id, userId, deployment?.id),
				this.userService.incrementDeployment(correspondindProject.user.toString()),
			]);

			if (deployment?._id) {
				await this.deployLocal(deployment._id, projectId, canDeploy.user._id);
			}
			return deployment;
		} catch (error) {
			await this.decrementRunningDeplymnts(projectId, canDeploy.user._id);
			throw error;
		}
	}

	async getDeploymentById(id: string, userId: string, includes?: string): Promise<IDeployment | null> {
		return await this.deploymentRepository.findDeploymentById(id, userId, { includes, exclude: ["file_structure"] });
	}
	async getDeploymentFiles(id: string, userId: string, includes?: string): Promise<IDeployment | null> {
		return await this.deploymentRepository.findDeploymentById(id, userId, {
			fields: ["file_structure"],
		});
	}

	async getAllDeployments(userId: string, query: QueryDeploymentDTO): Promise<{ deployments: IDeployment[]; total: number }> {
		return await this.deploymentRepository.findAllDeployments(userId, query, { fields: !query.full ? deploymentBasicFields : [] });
	}

	async getProjectDeployments(
		userId: string,
		projectId: string,
		query: QueryDeploymentDTO,
	): Promise<{ deployments: IDeployment[]; total: number }> {
		const correspondindProject = await this.projectRepository.findProject(projectId, userId);
		if (!correspondindProject) {
			throw new AppError(PROJECT_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		return await this.deploymentRepository.findProjectDeployments(userId, projectId, query, { fields: !query.full ? deploymentBasicFields : [] });
	}

	async deleteDeployment(projectId: string, deploymentId: string, userId: string): Promise<number> {
		const project = await this.projectRepository.findProject(projectId, userId);
		if (!project) throw new AppError(PROJECT_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);

		if (project.status === ProjectStatus.BUILDING || project.status === ProjectStatus.QUEUED) {
			throw new AppError(PROJECT_ERRORS.PROJECT_IN_PROGRESS, STATUS_CODES.CONFLICT);
		}

		if (!project.deployments?.includes(deploymentId as any)) {
			throw new AppError(DEPLOYMENT_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		let newCurrentDeployment = null;

		if (project.currentDeployment === deploymentId) {
			const allDeployments = await this.deploymentRepository.__findAllProjectDeployment(projectId, "createdAt");
			const currentIndex = allDeployments.findIndex((d) => d._id.toString() === deploymentId);
			// console.log(allDeployments, "<<<<", currentIndex);

			if (currentIndex > 0) {
				newCurrentDeployment = allDeployments[currentIndex - 1];
			}
		}

		const nextStatus = newCurrentDeployment
			? newCurrentDeployment.status
			: deploymentId === project.currentDeployment
				? ProjectStatus.NOT_STARTED
				: project.status;

		const [_, deleteResult] = await Promise.all([
			this.projectRepository.pullDeployments(
				projectId,
				userId,
				deploymentId,
				newCurrentDeployment ? newCurrentDeployment._id : deploymentId === project.currentDeployment ? null : project.currentDeployment,
			),
			this.deploymentRepository.deleteDeployment(projectId, deploymentId, userId),
			this.deleteCloud(deploymentId, project._id),
			this.logsService.deleteDeploymentLogs(deploymentId),
			...(project.status !== nextStatus ? [this.projectRepository.__updateProject(project._id, { status: nextStatus as ProjectStatus })] : []),
		]);
		return deleteResult;
	}

	async deployLocal(deploymentId: string, projectId: string, userId: string): Promise<void> {
		try {
			const envs = getNessesaryEnvs();
			const command = spawn("node", ["script.js"], {
				cwd: "../build-server/",
				env: {
					...process.env,
					DEPLOYMENT_ID: deploymentId,
					PROJECT_ID: projectId,
				},

			})
			command.stdout?.on("data", (data) => {
				console.log(`[stdout]: -----data-----from----deployLocal`);
			});
			command.stderr?.on("data", (data) => {
				console.error(`[stderr]: ${data.toString().trim()}`);
			});
			command.on("exit", (code) => {
				console.log(`Process exited with code ${code}`);
			});

			command.on("error", (err) => {
				console.error("Failed to start process:", err);
			});
			return
			const result = await dispatchBuild(deploymentId, projectId);
			console.log(result, " - - - ");
		} catch (error: any) {
			console.log("Error on build");
			await this.__updateDeployment(projectId, deploymentId, {
				status: DeploymentStatus.FAILED,
				error_message: DEPLOYMENT_ERRORS.DEPLOY_FAILED,
			});
			await this.decrementRunningDeplymnts(projectId, userId);
			throw error;
		}
	}
	async deployCloud(project: IProject, deployment: IDeployment): Promise<void> {
		try {
			const command = new RunTaskCommand({
				cluster: config.CLUSTER,
				taskDefinition: config.TASK,
				launchType: "FARGATE",
				count: 1,
				networkConfiguration: {
					awsvpcConfiguration: {
						subnets: ENVS.SUBNETS_STRING?.split(","),
						securityGroups: ENVS.SECURITY_GROUPS?.split(","),
						assignPublicIp: "ENABLED",
					},
				},
				overrides: {
					containerOverrides: [
						{
							name: ENVS.CONTAINER_NAME, // docker image after build,
							environment: [
								...getNessesaryEnvs(),
								{ name: "SERVER_PUSHED_D_ID", value: deployment._id },
								{ name: "SERVER_PUSHED_P_ID", value: project.id },
							],
						},
					],
				},
			});
			await ecsClient.send(command);
		} catch (error: any) {
			await this.__updateDeployment(project._id, deployment._id, {
				status: DeploymentStatus.FAILED,
				error_message: DEPLOYMENT_ERRORS.DEPLOY_FAILED,
			});
			throw error;
		}
	}

	async deleteLocal(deploymentId: string, projectId: string): Promise<void> {
		// Make a delete files api call to the mock s3 server.
	}

	async deleteCloud(deploymentId: string, projectId: string): Promise<void> {
		const prefix = `${S3_OUTPUTS_DIR}/${projectId}/${deploymentId}/`;
		const APP_FILES_BUCKET = ENVS.CLOUD_BUCKET;
		const listCommand = new ListObjectsV2Command({
			Bucket: APP_FILES_BUCKET,
			Prefix: prefix,
		});
		const listed = await s3Client.send(listCommand);
		if (!listed.Contents || listed.Contents.length === 0) {
			return;
		}
		const deleteCommand = new DeleteObjectsCommand({
			Bucket: APP_FILES_BUCKET,
			Delete: {
				Objects: listed.Contents.map((obj: _Object) => ({ Key: obj.Key })),
			},
		});
		await s3Client.send(deleteCommand);
	}

	async incrementRunningDeplymnts(projectId: string, userId: string, userPlan: string): Promise<void> {
		await this.redisCache.setAdd(this.DEPLOYMENTS_SET_KEY, projectId);
		const currentRunningDpymnts = await this.redisCache.getSetLength(this.DEPLOYMENTS_SET_KEY);
		if (currentRunningDpymnts > this.MAX_CONCURRENT_RUNNABLE_DPYMNTS) {
			await this.redisCache.setRemove(this.DEPLOYMENTS_SET_KEY, projectId);
			throw new AppError(DEPLOYMENT_ERRORS.BUSY_RUNNERS, STATUS_CODES.SERVICE_UNAVAILABLE);
		}
		const key = `${this.USER_CONCURRENCY_KEY_PREFIX}:${userId}`
		const current = await this.redisCache.incrementKey(key)

		if (current === 1) {
			await this.redisCache.setKeyExpiry(key, this.USER_CONCURRENCY_TTL_SECONDS);
		}
		if (Number(current) > PLANS[userPlan as IUser['plan']].concurrentBuilds) {
			await this.redisCache.decrementKey(key)
			throw new AppError(DEPLOYMENT_ERRORS.CONCURRENT_LIMIT, STATUS_CODES.SERVICE_UNAVAILABLE);
		}
	}
	async decrementRunningDeplymnts(projectId: string, userId?: string): Promise<void> {
		let project = null
		if (!userId) {
			project = await this.projectRepository.__findProject(projectId)
		}
		const fetchedUserId = project?.user.toString()
		await Promise.all([
			this.redisCache.setRemove(this.DEPLOYMENTS_SET_KEY, projectId),
			...(userId
				? [this.redisCache.decrementKey(`${this.USER_CONCURRENCY_KEY_PREFIX}:${userId}`)]
				: [this.redisCache.decrementKey(`${this.USER_CONCURRENCY_KEY_PREFIX}:${fetchedUserId}`)]
			)
		])
	}

	async __getDeploymentById(id: string): Promise<IDeployment | null> {
		//container
		return this.deploymentRepository.__findDeployment(id);
	}

	async __updateDeployment(projectId: string, deploymentId: string, updateData: Partial<IDeployment>): Promise<IDeployment | null> {
		return await this.deploymentRepository.__updateDeployment(projectId, deploymentId, updateData);
	}
}

export default DeploymentService;
