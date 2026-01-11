import { IDeployment } from "../../models/Deployment.js";

export interface IDeploymentRepository {
	getDeploymentByPublicId(publicId: string): Promise<IDeployment | null>
}