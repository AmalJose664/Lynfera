import { DeploymentStatus, IDeployment } from "@/models/Deployment.js";
import { IProject } from "@/models/Projects.js";
import { IUserSerivce } from "./IUserService.js";

export interface IDeploymentService {
	newDeployment(deploymentData: Partial<IDeployment>, userId: string, projectId: string, isRedeploy: boolean): Promise<IDeployment | null>;
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

	deployCloud(project: IProject, deployment: IDeployment, token?: string): Promise<void>;
	deployLocal(deploymentId: string, projectId: string, token?: string): Promise<void>;
	deleteLocal(deploymentId: string, projectId: string): Promise<void>;
	deleteCloud(deploymentId: string, projectId: string): Promise<void>;
	deleteCloudDeploysMultiple(projectId: string): Promise<void>;

	incrementRunningDeplymnts(projectId: string, userId: string, userPlan: string): Promise<void>;
	decrementRunningDeplymnts(projectId: string, userId?: string): Promise<void>;

	newPushDeployment(deploymentData: Partial<IDeployment>, project: IProject, installationId?: number): Promise<{ status: string; reason: string }>;
	createNewFailedDeployment(deployData: Partial<IDeployment>, project: IProject, reason: string): Promise<IDeployment | null>;
}
