import { ResponseJSON, ResultSet } from "@clickhouse/client";
import { ILogRepository } from "../interfaces/repository/ILogRepository.js";
import { ILogsService } from "../interfaces/service/ILogsService.js";
import { IDeploymentRepository } from "../interfaces/repository/IDeploymentRepository.js";
import AppError from "../utils/AppError.js";

class LogsService implements ILogsService {
	private logsRepository: ILogRepository;
	private deploymentRepository: IDeploymentRepository;

	constructor(logRepo: ILogRepository, depRepo: IDeploymentRepository) {
		this.logsRepository = logRepo;
		this.deploymentRepository = depRepo;
	}
	async getDeploymentLog(
		deploymentId: string,
		userId: string,
		pagination: { page?: number; limit: number },
	): Promise<{
		logs: ResponseJSON<unknown>["data"];
		total: number;
		page: number;
		limit: number;
	}> {
		const deployment = await this.deploymentRepository.findDeploymentById(deploymentId, userId);
		if (!deployment) {
			throw new AppError("Deployment not found ", 404);
		}
		const { limit, page } = pagination;

		const data = await this.logsRepository.getLogs(deploymentId, page || 1, limit || 100);
		return {
			logs: data.data,
			total: Number((data.data[0] as { total: number })?.total || 0),
			page: page || 1,
			limit: limit || 100,
		};
	}
	async getProjectsLogs(
		projectId: string,
		userId: string,
		pagination: { page?: number; limit?: number },
	): Promise<{
		logs: ResponseJSON<unknown>["data"];
		total: number;
		page: number;
		limit: number;
	}> {
		const { limit, page } = pagination; // projet check herer ------------------------------------------------------
		const data = await this.logsRepository.getProjectLogs(projectId, page || 1, limit || 100);
		return {
			logs: data.data,
			total: Number((data.data[0] as { total: number })?.total || 0),
			page: page || 1,
			limit: limit || 100,
		};
	}
	async deleteProjectLogs(projectId: string): Promise<void> {
		return this.logsRepository.deleteProjectLogs(projectId)
	}
	async deleteDeploymentLogs(deploymentId: string): Promise<void> {
		return this.logsRepository.deletedeploymentLogs(deploymentId)
	}

	async __insertLog(log: string, projectId: string, deploymentId: string, reportTime: Date, info: string, sequence?: number): Promise<void> {
		await this.logsRepository.__insertLogs({ deploymentId, log, projectId, reportTime, info, sequence });
	}
}

export default LogsService;
