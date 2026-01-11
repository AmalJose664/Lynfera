
import { Model } from "mongoose";
import { Deployment, IDeployment } from "../models/Deployment.js";
import { IDeploymentRepository } from "../interfaces/repository/IDeploymentRepository.js";

class DeploymentRepository implements IDeploymentRepository {
	private model: Model<IDeployment>
	constructor(deploymentModel: Model<IDeployment>) {
		this.model = deploymentModel
	}
	async getDeploymentByPublicId(publicId: string): Promise<IDeployment | null> {
		return this.model.findOne({ publicId })
	}
}
export const deploymentRepo = new DeploymentRepository(Deployment);
