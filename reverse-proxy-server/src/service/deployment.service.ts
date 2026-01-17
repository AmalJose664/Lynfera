import { redisService } from "../cache/redis.js";
import { IRedisCache } from "../interfaces/cache/IRedis.js";
import { IDeploymentRepository } from "../interfaces/repository/IDeploymentRepository.js";
import { DeploymentResult, IDeploymentService } from "../interfaces/service/IDeploymentService.js";
import { IDeployment } from "../models/Deployment.js";
import { deploymentRepo } from "../repository/deployment.repo.js";

// ←
class DeploymentService implements IDeploymentService {
	private deploymentRepo: IDeploymentRepository;

	private redisCache: IRedisCache
	constructor(deploymentRepo: IDeploymentRepository, redisCache: IRedisCache) {
		this.deploymentRepo = deploymentRepo;
		this.redisCache = redisCache
	}

	async findDeploymentByPublicId(publicId: string): Promise<DeploymentResult | null> {
		const dataFromCache = await this.redisCache.get<DeploymentResult>(publicId) || null

		if (dataFromCache) {
			return dataFromCache as DeploymentResult
		}
		const deployment = await this.deploymentRepo.getDeploymentByPublicId(publicId)
		if (!deployment) {
			return null
		}

		const deploymentRefined = {
			_id: deployment._id.toString(),
			projectId: deployment.project.toString(),
		}
		this.redisCache.set(publicId, deploymentRefined)
		return deploymentRefined
	}
	invalidateSlug(publicId: string): boolean {
		return Boolean(this.redisCache.del(publicId))
	}
}


export const deploymentService = new DeploymentService(deploymentRepo, redisService)