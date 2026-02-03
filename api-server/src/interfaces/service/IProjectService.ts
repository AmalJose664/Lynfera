import { CreateProjectDTO, QueryProjectDTO } from "@/dtos/project.dto.js";
import { IProject } from "@/models/Projects.js";
import { DailyDeployments, ProjectUsageResults } from "../repository/IDeploymentRepository.js";

export type options = {
	updateStatusOnlyIfNoCurrentDeployment?: boolean;
};
export interface IProjectService {
	createProject(projectData: CreateProjectDTO, userId: string): Promise<IProject | null>;

	getAllProjects(userId: string, query: QueryProjectDTO): Promise<{ projects: IProject[]; total: number }>;
	getProjectById(id: string, userId: string, include?: string, full?: boolean): Promise<IProject | null>;
	getProjectSettings(id: string, userId: string, include?: string): Promise<IProject | null>;
	updateProject(id: string, userId: string, data: Partial<IProject>): Promise<IProject | null>;
	deleteProject(projectId: string, userId: string): Promise<boolean>;
	getProjectBandwidthData(projectId: string, userId: string, isMonthly: boolean): Promise<number>;
	getUserBandwidthData(userId: string, isMonthly: boolean): Promise<number>;
	changeProjectSubdomain(userId: string, projectId: string, newSubdomain: string): Promise<IProject | null>;
	checkSubdomainAvaiable(newSubdomain: string): Promise<boolean>;
	findProjectSimpleStats(
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
	}>;

	findTotalUsage(
		userId: string,
		months: number,
	): Promise<{
		projectRslts: ProjectUsageResults[];
		deploys: DailyDeployments[];
	}>;

	__getProjectById(id: string): Promise<IProject | null>;
	__updateProjectById(projectId: string, updateData: Partial<IProject>, options?: options): Promise<IProject | null>;
}
