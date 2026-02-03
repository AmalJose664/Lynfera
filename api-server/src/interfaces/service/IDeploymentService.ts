import { DeploymentStatus, IDeployment } from "@/models/Deployment.js";
import { IProject } from "@/models/Projects.js";

export interface IDeploymentService {
	newDeployment(deploymentData: Partial<IDeployment>, userId: string, projectId: string): Promise<IDeployment | null>;
	getAllDeployments(
		userId: string,
		query: {
			page: number;
			limit: number;
			status?: DeploymentStatus;
			search?: string;
		},
	): Promise<{ deployments: IDeployment[]; total: number }>;

	getDeploymentById(id: string, userId: string, includes?: string): Promise<IDeployment | null>;
	getDeploymentFiles(id: string, userId: string, includes?: string): Promise<IDeployment | null>;
	getProjectDeployments(
		userId: string,
		projectId: string,
		query: {
			page: number;
			limit: number;
			status?: DeploymentStatus;
			search?: string;
		},
	): Promise<{ deployments: IDeployment[]; total: number }>;

	deleteDeployment(projectId: string, deploymentId: string, userId: string): Promise<number>;

	__getDeploymentById(id: string): Promise<IDeployment | null>;
	__updateDeployment(projectId: string, deploymentId: string, updateData: Partial<IDeployment>): Promise<IDeployment | null>;

	deployCloud(project: IProject, deployment: IDeployment): Promise<void>;
	deployLocal(deploymentId: string, projectId: string, userId: string): Promise<void>;
	deleteLocal(deploymentId: string, projectId: string): Promise<void>;
	deleteCloud(deploymentId: string, projectId: string): Promise<void>;

	incrementRunningDeplymnts(projectId: string, userId: string, userPlan: string): Promise<void>;
	decrementRunningDeplymnts(projectId: string, userId?: string): Promise<void>;
}
