import { Request, Response, NextFunction } from "express";
import { v4 } from "uuid";

import { ILogsController } from "@/interfaces/controller/ILogsController.js";
import { ILogsService } from "@/interfaces/service/ILogsService.js";
import { LogMapper } from "@/mappers/LogsMapper.js";
import { sseManager } from "@/events/deploymentEmitter.js";
import { IDeploymentService } from "@/interfaces/service/IDeploymentService.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { DEPLOYMENT_ERRORS } from "@/constants/errors.js";
import { DeploymentStatus } from "@/models/Deployment.js";

class LogsController implements ILogsController {
	private logsService: ILogsService;
	private deploymentService: IDeploymentService
	constructor(logsService: ILogsService, deplyService: IDeploymentService) {
		this.logsService = logsService;
		this.deploymentService = deplyService
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
		const user = req.user?.id as string;
		try {
			const deplomentExist = await this.deploymentService.getDeploymentById(id, user)
			if (!deplomentExist) {
				res.status(STATUS_CODES.NOT_FOUND).json({
					status: 404,
					error: "not_found",
					message: DEPLOYMENT_ERRORS.NOT_FOUND,
				})
				return
			}
			if (!(deplomentExist.status === DeploymentStatus.BUILDING || deplomentExist.status === DeploymentStatus.QUEUED)) {
				res.status(STATUS_CODES.CONFLICT).json({
					status: STATUS_CODES.CONFLICT,
					error: "Cant connect to deployment",
					message: DEPLOYMENT_ERRORS.NO_ACTIVE_DEPLOYMENT,
				})
				return
			}
			sseManager.addClient(v4(), id, res, req);
		} catch (error) {
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
