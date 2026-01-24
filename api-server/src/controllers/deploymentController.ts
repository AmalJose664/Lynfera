import { Request, Response, NextFunction } from "express";

import { IDeploymentController } from "@/interfaces/controller/IDeploymentController.js";
import { IDeploymentService } from "@/interfaces/service/IDeploymentService.js";
import { DeploymentMapper } from "@/mappers/DeploymentMapper.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { QueryDeploymentDTO } from "@/dtos/deployment.dto.js";
import { COMMON_ERRORS } from "@/constants/errors.js";

class DeploymentController implements IDeploymentController {
	private deploymentService: IDeploymentService;
	constructor(deployService: IDeploymentService) {
		this.deploymentService = deployService;
	}

	async createDeployment(req: Request, res: Response, next: NextFunction): Promise<void> {
		const userId = req.user?.id as string;
		const projectId = req.params.projectId;
		try {
			const deployment = await this.deploymentService.newDeployment({}, userId, projectId);

			if (!deployment) {
				res.status(STATUS_CODES.BAD_REQUEST).json({ deployment: null });
				return;
			}
			const response = DeploymentMapper.toDeploymentFullResponse(deployment);
			res.status(STATUS_CODES.CREATED).json(response);
		} catch (error) {
			next(error);
		}
	}

	async getDeployment(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const deploymentId = req.params.deploymentId;
			const includesField = req.query.include as string;

			const result = await this.deploymentService.getDeploymentById(deploymentId, userId, includesField);
			if (result) {
				const response = DeploymentMapper.toDeploymentFullResponse(result);
				res.status(STATUS_CODES.OK).json(response);
				return;
			}
			res.status(STATUS_CODES.NOT_FOUND).json({ deployment: null });
		} catch (error) {
			next(error);
		}
	}

	async getDeploymentsByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const query = req.validatedQuery as QueryDeploymentDTO;

			const projectId = req.params.projectId;

			const result = await this.deploymentService.getProjectDeployments(userId, projectId, query);
			const response = DeploymentMapper.toDeployments(
				result.deployments,
				{
					total: result.total,
					page: query.page,
					limit: query.limit,
				},
				query.full ? "full" : "overview",
			);
			res.status(STATUS_CODES.OK).json(response);
		} catch (error) {
			next(error);
		}
	}

	async getDeploymentFilesData(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const deploymentId = req.params.deploymentId;

			const result = await this.deploymentService.getDeploymentFiles(deploymentId, userId);
			if (!result) {
				res.status(STATUS_CODES.NOT_FOUND).json({
					status: 404,
					error: "not_found",
					message: COMMON_ERRORS.NOT_FOUND,
				});
				return;
			}
			const response = DeploymentMapper.toDeploymentFilesResponse(result);
			res.status(STATUS_CODES.OK).json(response);
		} catch (error) {
			next(error);
		}
	}
	async getAllDeployments(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const query = req.validatedQuery as QueryDeploymentDTO;

			const result = await this.deploymentService.getAllDeployments(userId, query);
			const response = DeploymentMapper.toDeployments(
				result.deployments,
				{
					total: result.total,
					page: query.page,
					limit: query.limit,
				},
				query.full ? "full" : "overview",
			);
			res.status(STATUS_CODES.OK).json(response);
		} catch (error) {
			next(error);
		}
	}

	async deleteDeployment(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const deploymentId = req.params.deploymentId;
			const projectId = req.params.projectId;

			const result = await this.deploymentService.deleteDeployment(projectId, deploymentId, req.user?.id as string);
			if (result !== 0) {
				res.status(STATUS_CODES.NO_CONTENT).json({ deleted: true });
				return;
			}
			res.status(STATUS_CODES.NO_CONTENT).json({});
		} catch (error) {
			next(error);
		}
	}

	async __getDeployment(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const deploymentId = req.params.id;
			const deployment = await this.deploymentService.__getDeploymentById(deploymentId);
			if (deployment) {
				const response = DeploymentMapper.toDeploymentFullResponse(deployment);
				res.status(STATUS_CODES.OK).json(response);
				return;
			}
			res.status(STATUS_CODES.NOT_FOUND).json({ deployment: null });
			console.log("not found");
		} catch (error) {
			next(error);
		}
	}
}

export default DeploymentController;
