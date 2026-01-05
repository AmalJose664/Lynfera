import { ResponseJSON, ResultSet } from "@clickhouse/client";

export interface LogModel {
	info: string;
	log: string;
	deploymentId: string;
	projectId: string;
	reportTime: Date;
	sequence?: number;
}
export interface ILogRepository {
	getProjectLogs(deploymentId: string, page: number, limit: number): Promise<ResponseJSON<unknown>>;
	getLogs(projectId: string, page: number, limit: number): Promise<ResponseJSON<unknown>>;
	deletedeploymentLogs(deploymentId: string): Promise<void>
	deleteProjectLogs(projectId: string): Promise<void>
	__insertLogs(data: LogModel): Promise<void>;
}
