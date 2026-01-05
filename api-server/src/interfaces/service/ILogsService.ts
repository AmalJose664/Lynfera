import { ResponseJSON, ResultSet } from "@clickhouse/client";

export interface ILogsService {
	getDeploymentLog(
		deploymentId: string,
		userId: string,
		pagination: { page?: number; limit?: number },
	): Promise<{
		logs: ResponseJSON<unknown>["data"];
		total: number;
		page: number;
		limit: number;
	}>;
	getProjectsLogs(
		projectId: string,
		userId: string,
		pagination: { page?: number; limit?: number },
	): Promise<{
		logs: ResponseJSON<unknown>["data"];
		total: number;
		page: number;
		limit: number;
	}>;
	deleteProjectLogs(projectId: string): Promise<void>
	deleteDeploymentLogs(deploymentId: string): Promise<void>
	__insertLog(log: string, projectId: string, deploymentId: string, reportTime: Date, info: string): Promise<void>;
}
