import { DEPLOYMENT_ERRORS } from "@/constants/errors.js";
import KafkaEventConsumer from "@/events/consumers.js";
import { IDeploymentRepository } from "@/interfaces/repository/IDeploymentRepository.js";
import { ILogRepository, LogModel } from "@/interfaces/repository/ILogRepository.js";
import { ILogsService } from "@/interfaces/service/ILogsService.js";
import { ILogs } from "@/models/Logs.js";
import AppError from "@/utils/AppError.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { ResponseJSON, ResultSet } from "@clickhouse/client";

class LogsService implements ILogsService {
	private logsRepository: ILogRepository;
	private deploymentRepository: IDeploymentRepository;
	private consumer?: KafkaEventConsumer;

	private logsBuffer: ILogs[] = [];
	private readonly BATCH_SIZE = 2000;
	private readonly MAX_BUFFER_SIZE = 10000;
	private isSaving = false;
	private isPaused = false;

	constructor(logRepo: ILogRepository, depRepo: IDeploymentRepository) {
		this.logsRepository = logRepo;
		this.deploymentRepository = depRepo;
	}
	public setConsumer(consumer: KafkaEventConsumer) {
		this.consumer = consumer;
		console.log("Consumer added ...");
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
			throw new AppError(DEPLOYMENT_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
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
		return this.logsRepository.deleteProjectLogs(projectId);
	}
	async deleteDeploymentLogs(deploymentId: string): Promise<void> {
		return this.logsRepository.deletedeploymentLogs(deploymentId);
	}

	async saveBatch(): Promise<void> {
		if (this.isSaving || this.logsBuffer.length === 0) {
			// process.stdout.write(" '");
			return;
		}
		this.isSaving = true;
		const batch = this.logsBuffer.splice(0, this.BATCH_SIZE);
		try {
			await this.__saveLogAsBatch(batch);
			console.log(`Saved ${batch.length} logs `);
		} catch (error) {
			console.error("save logs error:", error, "Discarding data");
		} finally {
			this.isSaving = false;
			if (this.logsBuffer.length >= this.BATCH_SIZE) {
				setImmediate(() => this.saveBatch());
			}
			if (this.isPaused && this.logsBuffer.length < 2000) {
				console.log("Buffer healthy, resuming...");
				this.consumer?.resumeLogs();
				this.isPaused = false;
			}
		}
	}

	async flushLogs(): Promise<void> {
		if (this.isSaving || this.logsBuffer.length === 0) {
			process.stdout.write(" '");
			return;
		}
		console.log("saving ....", this.logsBuffer.length);
		this.isSaving = true;
		try {
			while (this.logsBuffer.length > 0) {
				const logsSlice = this.logsBuffer.splice(0, 200);
				await this.__saveLogAsBatch(logsSlice);
				console.log(`Successfully flushed ${logsSlice.length} logs to DB.`);
			}
		} catch (error) {
			console.error("Failed to flush log batch:", error);
		} finally {
			this.isSaving = false;
		}
	}

	__insertToBatch(logs: ILogs[]): void {
		this.logsBuffer.push(...logs);

		if (this.logsBuffer.length > this.MAX_BUFFER_SIZE) {
			console.warn("Buffer full! Pausing consumer.");
			this.consumer?.pauseLogs();
			this.isPaused = true;
			setImmediate(() => this.saveBatch());
			return;
		}
		// this.flushLogs()     // save to db on arrival instead of interval, use this to save on each message incoming. This will stop once message saving finishes
		if (this.logsBuffer.length >= this.BATCH_SIZE) {
			this.saveBatch();
		}
	}

	async __saveLog(log: string, projectId: string, deploymentId: string, reportTime: Date, info: string, sequence?: number): Promise<void> {
		await this.logsRepository.__insertLog({ deploymentId, log, projectId, reportTime, info, sequence });
	}

	async __saveLogAsBatch(logs: ILogs[]): Promise<void> {
		// await new Promise((res) => setTimeout(res, 2000))
		console.log(logs[0].event_id);
		await this.logsRepository.__insertLogsAsBatch(logs);
	}

	async exitService(): Promise<void> {
		console.log("service cleaning logs....");
		while (this.logsBuffer.length > 0) {
			if (this.isSaving) {
				await new Promise((resolve) => setTimeout(resolve, 500));
				continue;
			}
			await this.saveBatch();
		}
	}
}

export default LogsService;
