import { Types } from "mongoose";
import { generateSlug } from "random-word-slugs";

import { IProjectService, options } from "@/interfaces/service/IProjectService.js";
import { IProjectRepository } from "@/interfaces/repository/IProjectRepository.js";
import { DailyDeployments, IDeploymentRepository, ProjectUsageResults } from "@/interfaces/repository/IDeploymentRepository.js";
import { IUserRepository } from "@/interfaces/repository/IUserRepository.js";
import { ILogsService } from "@/interfaces/service/ILogsService.js";
import { IProjectBandwidthRepository } from "@/interfaces/repository/IProjectBandwidthRepository.js";
import { IRedisCache } from "@/interfaces/cache/IRedisCache.js";
import { CreateProjectDTO, QueryProjectDTO } from "@/dtos/project.dto.js";
import { IProject, ProjectStatus } from "@/models/Projects.js";
import { nanoid } from "@/utils/generateNanoid.js";
import AppError from "@/utils/AppError.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { PLANS } from "@/constants/plan.js";
import { projectBasicFields, projectSettingsFields } from "@/constants/populates/project.populate.js";
import { DeploymentStatus } from "@/models/Deployment.js";
import { DEPLOYMENT_ERRORS, PROJECT_ERRORS, USER_ERRORS } from "@/constants/errors.js";
import { ADDITIONAL_RESERVED_SUBDOMAINS, BRAND_PROTECTION_REGEX, RESERVED_SUBDOMAINS } from "@/constants/subdomain.js";


class ProjectService implements IProjectService {
	private projectRepository: IProjectRepository;
	private deploymentRepository: IDeploymentRepository;
	private userRepository: IUserRepository;
	private logsService: ILogsService;
	private projectBandwidthRepo: IProjectBandwidthRepository;
	private cacheInvalidator: IRedisCache;

	constructor(
		projectRepo: IProjectRepository,
		userRepo: IUserRepository,
		projectBandwidthRepo: IProjectBandwidthRepository,
		deploymentRepo: IDeploymentRepository,
		logsService: ILogsService,
		cacheInvalidator: IRedisCache,
	) {
		this.projectRepository = projectRepo;
		this.userRepository = userRepo;
		this.projectBandwidthRepo = projectBandwidthRepo;
		this.deploymentRepository = deploymentRepo;
		this.logsService = logsService;
		this.cacheInvalidator = cacheInvalidator;
	}
	async createProject(dto: CreateProjectDTO, userId: string): Promise<IProject | null> {
		const projectData: Partial<Omit<IProject, keyof Document>> = {
			name: dto.name,
			user: new Types.ObjectId(userId),
			repoURL: dto.repoURL,
			branch: dto.branch,
			buildCommand: dto.buildCommand,
			env: dto.env || [],
			installCommand: "install", //dto.installCommand,
			outputDirectory: dto.outputDirectory,
			rootDir: dto.rootDir,
			subdomain: `${generateSlug(2)}-${nanoid(6)}`,
		};

		const user = await this.userRepository.findByUserId(userId);
		if (!user) {
			throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		if (user?.projects > PLANS[user.plan].maxProjects) {
			throw new AppError(PROJECT_ERRORS.LIMIT_REACHED, STATUS_CODES.FORBIDDEN);
		}
		const newProject = await this.projectRepository.createProject(projectData);
		await this.projectBandwidthRepo.addProjectField(newProject as IProject);
		await this.userRepository.incrementProjects(user.id);

		return newProject;
	}

	async getAllProjects(userId: string, query: QueryProjectDTO): Promise<{ projects: IProject[]; total: number }> {
		return await this.projectRepository.getAllProjects(userId, {
			...query,
			...(!query.full && {
				fields: projectBasicFields,
			}),
		});
	}

	async getProjectById(id: string, userId: string, include?: string, full?: boolean): Promise<IProject | null> {
		const user = await this.userRepository.findByUserId(userId);
		if (!user) {
			throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		const project = await this.projectRepository.findProject(id, userId, {
			include: include,
			...(!full && {
				fields: projectBasicFields,
			}),
		});
		return project;
	}
	async getProjectSettings(id: string, userId: string, include?: string): Promise<IProject | null> {
		const user = await this.userRepository.findByUserId(userId);
		if (!user) {
			throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		const project = await this.projectRepository.findProject(id, userId, {
			include: include,
			fields: projectSettingsFields,
		});

		return project;
	}

	async updateProject(id: string, userId: string, dto: Partial<IProject>): Promise<IProject | null> {
		const user = await this.userRepository.findByUserId(userId);
		if (!user) {
			throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		const newData: Partial<IProject> = {
			...(dto.name && { name: dto.name }),
			...(dto.branch && { branch: dto.branch }),
			// ...(dto.installCommand && { installCommand: dto.installCommand }),
			...(dto.buildCommand && { buildCommand: dto.buildCommand }),
			...(dto.rootDir && { rootDir: dto.rootDir }),
			...(dto.outputDirectory && { outputDirectory: dto.outputDirectory }),
			...(dto.hasOwnProperty("rewriteNonFilePaths") && { rewriteNonFilePaths: dto.rewriteNonFilePaths }),
			...(dto.hasOwnProperty("isDisabled") && { isDisabled: dto.isDisabled }),
			...(dto.env?.length && { env: dto.env.map((en) => ({ name: en.name, value: en.value })) }),
		};
		if (!newData || Object.keys(newData).length === 0) {
			return null;
		}
		const project = await this.projectRepository.updateProject(id, userId, newData);
		if (dto.hasOwnProperty("isDisabled") && project) {
			await this.cacheInvalidator.publishInvalidation("project", project.subdomain);
		}

		return project;
	}

	async deleteProject(projectId: string, userId: string): Promise<boolean> {
		const user = await this.userRepository.findByUserId(userId);
		if (!user) {
			throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}

		const result = await this.projectRepository.deleteProject(projectId, userId);
		if (!result) {
			return false;
		}
		await this.userRepository.decrementProjects(userId);
		await this.logsService.deleteProjectLogs(projectId);
		await this.cacheInvalidator.publishInvalidation("project", result.subdomain);
		return true;
	}

	async getProjectBandwidthData(projectId: string, userId: string, isMonthly: boolean): Promise<number> {
		if (isMonthly) {
			return await this.projectBandwidthRepo.getProjectMonthlyBandwidth(projectId, userId);
		}
		return await this.projectBandwidthRepo.getProjectTotalBandwidth(projectId, userId);
	}
	async getUserBandwidthData(userId: string, isMonthly: boolean): Promise<number> {
		if (isMonthly) {
			return this.projectBandwidthRepo.getUserMonthlyBandwidth(userId);
		}
		return await this.projectBandwidthRepo.getUserTotalBandwidth(userId);
	}
	async checkSubdomainAvaiable(newSubdomain: string): Promise<boolean> {
		const word = newSubdomain.toLowerCase().trim()
		if (word.includes("--")) {
			return false
		}
		if (BRAND_PROTECTION_REGEX.test(word)) {
			return false
		}
		if (RESERVED_SUBDOMAINS.has(newSubdomain) || ADDITIONAL_RESERVED_SUBDOMAINS.has(newSubdomain)) {
			return false
		}

		const anyProjectId = await this.projectRepository.checkProjectExistBySubdomain(newSubdomain);
		if (anyProjectId) {
			return false;
		}
		return true;
	}
	async changeProjectSubdomain(userId: string, projectId: string, newSubdomain: string): Promise<IProject | null> {
		const [isAvailable, project] = await Promise.all([
			this.checkSubdomainAvaiable(newSubdomain),
			this.projectRepository.findProject(projectId, userId),
		]);
		if (!project) {
			throw new AppError(PROJECT_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		if (!isAvailable) {
			throw new AppError(PROJECT_ERRORS.SUBDOMAIN_NOT_AVAILABLE, STATUS_CODES.CONFLICT);
		}
		const result = await this.projectRepository.updateProject(project._id, userId, { subdomain: newSubdomain });
		if (result) await this.cacheInvalidator.publishInvalidation("project", project.subdomain);
		return result;
	}
	async changeProjectDeployment(userId: string, projectId: string, newDeploymentId: string): Promise<IProject | null> {
		const [project, deployment] = await Promise.all([
			this.projectRepository.findProject(projectId, userId),
			this.deploymentRepository.findDeploymentById(newDeploymentId, userId),
		]);
		if (!project) {
			throw new AppError(PROJECT_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		if (!deployment) {
			throw new AppError(DEPLOYMENT_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		if (project.currentDeployment === deployment._id.toString()) {
			throw new AppError(DEPLOYMENT_ERRORS.ALREADY_ACTIVE, STATUS_CODES.CONFLICT);
		}
		if (deployment.project.toString() !== project._id.toString()) {
			throw new AppError(DEPLOYMENT_ERRORS.NOT_RELATED, STATUS_CODES.FORBIDDEN);
		}
		if (project.status === ProjectStatus.BUILDING || project.status === ProjectStatus.QUEUED) {
			throw new AppError(PROJECT_ERRORS.PROJECT_IN_PROGRESS, STATUS_CODES.CONFLICT);
		}
		if (deployment.status !== DeploymentStatus.READY) {
			throw new AppError(DEPLOYMENT_ERRORS.CANT_MAKE_ACTIVE(deployment.status), STATUS_CODES.CONFLICT);
		}
		const result = await this.projectRepository.updateProject(project._id, userId, {
			lastDeployment: project.currentDeployment,
			currentDeployment: deployment._id.toString(),
		});
		if (result) await this.cacheInvalidator.publishInvalidation("project", result.subdomain);
		return result;
	}
	async findProjectSimpleStats(
		userId: string,
		projectId: string,
	): Promise<{
		totalDeployments: number;
		successRate: number;
		failureRate: number;
		failedBuilds: number;
		avgBuildTime: number;
		buildHistory: string[];
		lastDeployed: Date | null;
		bandwidth: number;
	}> {
		const [deploymentObj, projectBandwidth] = await Promise.all([
			this.deploymentRepository.findProjectDeployments(userId, projectId, { page: 1, limit: 5000 }),
			this.projectBandwidthRepo.getProjectMonthlyBandwidth(projectId, userId),
		]);
		const { deployments, total } = deploymentObj;
		const stats = deployments.reduce(
			(acc, curr) => {
				if (curr.status === DeploymentStatus.READY) acc.success++;
				else if (curr.status === DeploymentStatus.FAILED || curr.status === DeploymentStatus.CANCELED) {
					acc.failure++;
				}
				acc.totalBuildTime += (curr.complete_at ? curr.complete_at.getTime() - curr.createdAt.getTime() : curr.timings.duration_ms) || 0;
				return acc;
			},
			{ success: 0, failure: 0, totalBuildTime: 0 },
		);

		const totalReturned = deployments.length;
		const successRate = totalReturned === 0 ? 0 : Math.round((stats.success / totalReturned) * 100);
		const avgBuildTime = totalReturned === 0 ? 0 : Math.round(stats.totalBuildTime / total / 1000);

		const buildHistory = deployments.slice(0, 10).map((d) => d.status);
		return {
			totalDeployments: total,
			successRate,
			failureRate: totalReturned === 0 ? 0 : Math.round((stats.failure / total) * 100),
			failedBuilds: stats.failure,
			avgBuildTime,
			buildHistory,
			lastDeployed: deployments[0]?.createdAt || null,
			bandwidth: projectBandwidth,
		};
	}




	async findTotalUsage(userId: string, months: number): Promise<{
		projectRslts: ProjectUsageResults[],
		deploys: DailyDeployments[]
	}> {
		const [projectsWithResults, deploys] = await Promise.all([
			this.deploymentRepository.getTotalBuildTime(userId),
			this.deploymentRepository.getDailyDeployments(userId, Number(months))
		])
		return { projectRslts: projectsWithResults, deploys }

	}

	async __getProjectById(id: string): Promise<IProject | null> {
		//container  or internal only
		return await this.projectRepository.__findProject(id);
	}
	async __updateProjectById(projectId: string, updateData: Partial<IProject>, options?: options): Promise<IProject | null> {
		//container   or internal only

		if (options?.updateStatusOnlyIfNoCurrentDeployment) {
			const project = await this.__getProjectById(projectId);
			if (project?.currentDeployment) {
				updateData.status = ProjectStatus.READY;
			}
		}
		return await this.projectRepository.__updateProject(projectId, updateData);
	}
}

export default ProjectService;
