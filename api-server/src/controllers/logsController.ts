import { Request, Response, NextFunction } from "express";
import { v4 } from "uuid";

import { ILogsController } from "@/interfaces/controller/ILogsController.js";
import { ILogsService } from "@/interfaces/service/ILogsService.js";
import { LogMapper } from "@/mappers/LogsMapper.js";
import { deploymentEmitter, sseManager } from "@/events/deploymentEmitter.js";

class LogsController implements ILogsController {
	private logsService: ILogsService;
	constructor(logsService: ILogsService) {
		this.logsService = logsService;
	}

	async getLogsByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const projectId = req.params.projectId;
			const user = req.user?.id as string;
			const result = await this.logsService.getProjectsLogs(projectId, user, {});

			const response = LogMapper.toLogsResponse(result.logs, result.total);
			res.json(response);
			return;
		} catch (error) {
			next(error);
		}
	}
	async getLogsByDeployment(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const deploymentId = req.params.deploymentId;
			const user = req.user?.id as string;
			const result = await this.logsService.getDeploymentLog(deploymentId, user, {});

			const response = LogMapper.toLogsResponse(result.logs, result.total);
			res.json(response);
			return;
		} catch (error) {
			next(error);
		}
	}

	async streamLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
		const id = req.params.deploymentId;
		try {
			sseManager.addClient(v4(), id, res, req);
		} catch (error) {
			deploymentEmitter.offAll(id);
			next(error);
		}
	}

	async getData(req: Request, res: Response, next: NextFunction): Promise<void> {
		res.json({
			clientCount: sseManager.getClientCount(),
			listerCount: sseManager.getListeners(),
			listerners: sseManager.getEventFns(),
		});
	}
}

export default LogsController;
