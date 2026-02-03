import NodeCache from "node-cache";
import { IProjectRepo } from "../interfaces/repository/IProjectRepo.js";
import { IProjectService, ProjectRefined } from "../interfaces/service/IProjectService.js";
import { IProject, ProjectStatus, User } from "../models/Project.js";
import { projectRepo } from "../repository/project.repo.js";
import AppError from "../utils/AppError.js";
import { IProjectBandwidthRepository } from "../interfaces/repository/IProjectBandwidth.js";
import { projectBandwidthRepo } from "../repository/projectBandwidth.repo.js";
import { IPlans, PLANS } from "../constants/plan.js";
import { redisService } from "../cache/redis.js";
import { IRedisCache } from "../interfaces/cache/IRedis.js";


// ←
class ProjectService implements IProjectService {
	private projectRepository: IProjectRepo;
	private projectBandwidthRepo: IProjectBandwidthRepository
	private projectCache: NodeCache
	private redisCache: IRedisCache
	constructor(projectRepo: IProjectRepo, projectBandwidthRepo: IProjectBandwidthRepository, projectCache: NodeCache, redisCache: IRedisCache) {
		this.projectRepository = projectRepo;
		this.projectBandwidthRepo = projectBandwidthRepo
		this.projectCache = projectCache
		this.redisCache = redisCache
	}

	async findProjectBySlug(slug: string): Promise<ProjectRefined | null> {
		const dataFromCache = this.projectCache.get<ProjectRefined>(slug) || null

		if (dataFromCache) {
			return dataFromCache
		}
		const project = await this.projectRepository.getProjectBySlugWithUser(slug)
		if (!project) {
			return null
		}
		const bw = await this.projectBandwidthRepo.getUserMonthlyBandwidth(project?.user._id)
		const userPlan = (project.user as any)?.plan || "FREE"
		const userPlanBw = PLANS[userPlan as keyof IPlans].totalBandwidthGB * (1024 * 1024 * 1024)
		if (bw > userPlanBw) {
			throw new AppError("Limit exceed on bandwidth", 403)
		}

		const projectRefined: ProjectRefined = {
			_id: project._id.toString(),
			subdomain: project.subdomain,
			currentDeployment: project?.currentDeployment,
			tempDeployment: project?.tempDeployment,
			isDeleted: project.isDeleted,
			isDisabled: project.isDisabled,
			rewriteNonFilePaths: project.rewriteNonFilePaths
		}
		if ((project.status === ProjectStatus.BUILDING || project.status === ProjectStatus.QUEUED) && project.tempDeployment) {
			this.projectCache.set(slug, projectRefined, 50)
			return projectRefined;
		}
		this.projectCache.set(slug, projectRefined)
		return projectRefined;
	}
	invalidateSlug(slug: string): boolean {
		return Boolean(this.projectCache.del(slug))
	}
}


export const projectService = new ProjectService(projectRepo, projectBandwidthRepo, new NodeCache({
	stdTTL: 300,          // Node Cache not meant for scalability, use redis for scalability of project
	checkperiod: 60 * 3   // Node Cache not meant for scalability, use redis for scalability of project
}), redisService
)