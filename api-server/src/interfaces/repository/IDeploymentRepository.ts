import { QueryDeploymentDTO } from "@/dtos/deployment.dto.js";
import { IDeployment } from "@/models/Deployment.js";

export type DeploymentDbOptions = {
	fields?: string[];
	includes?: string;
	exclude?: string[];
};

export type ProjectUsageResults = {
	projectId: string, deploys: number, projectName: string,
	total_build: number, isDeleted: boolean,
	bandwidthMontly: number, bandwidthTotal: number,
	month: string
}

export interface IDeploymentRepository {
	createDeployment(deploymentData: Partial<IDeployment>): Promise<IDeployment | null>;
	findDeploymentById(id: string, userId: string, options?: DeploymentDbOptions): Promise<IDeployment | null>;

	findAllDeployments(
		userId: string,
		query: QueryDeploymentDTO,
		options?: DeploymentDbOptions,
	): Promise<{ deployments: IDeployment[]; total: number }>;
	findProjectDeployments(
		userId: string,
		projectId: string,
		query: QueryDeploymentDTO,
		options?: DeploymentDbOptions,
	): Promise<{ deployments: IDeployment[]; total: number }>;

	deleteDeployment(projectId: string, deploymentId: string, userId: string): Promise<number>;

	getTotalBuildTime(userId: string): Promise<ProjectUsageResults[]>

	__findDeployment(id: string): Promise<IDeployment | null>;

	__updateDeployment(projectId: string, deploymentId: string, updateData: Partial<IDeployment>): Promise<IDeployment | null>;
	__findAllProjectDeployment(projectId: string, sortOptions?: string | Record<string, 1 | -1>): Promise<IDeployment[]>;
}
