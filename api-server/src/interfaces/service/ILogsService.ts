import { ResponseJSON, ResultSet } from "@clickhouse/client";
import { LogModel } from "../repository/ILogRepository.js";
import { ILogs } from "@/models/Logs.js";

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
	deleteProjectLogs(projectId: string): Promise<void>;
	deleteDeploymentLogs(deploymentId: string): Promise<void>;

	__insertToBatch(logs: ILogs[]): void;

	__saveLog(log: string, projectId: string, deploymentId: string, reportTime: Date, info: string): Promise<void>;
	__saveLogAsBatch(logs: ILogs[]): Promise<void>;

	flushLogs(): Promise<void>;
	saveBatch(): Promise<void>;
	exitService(): Promise<void>;
}
