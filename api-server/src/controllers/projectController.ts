import { Request, Response, NextFunction } from "express";

import { IProjectController } from "@/interfaces/controller/IProjectController.js";
import ProjectService from "@/services/project.service.js";
import {
	checkSubdomainDTO,
	CreateProjectDTO,
	ProjectDeploymentUpdateDTO,
	QueryProjectDTO,
	UpdateProjectDTO,
	UpdateSubdomainDTO,
} from "@/dtos/project.dto.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { ProjectMapper } from "@/mappers/ProjectMapper.js";
import AppError from "@/utils/AppError.js";
import { PROJECT_ERRORS } from "@/constants/errors.js";

class ProjectController implements IProjectController {
	private projectService: ProjectService;

	constructor(projectService: ProjectService) {
		this.projectService = projectService;
	}
	async createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const dto = req.validatedBody as CreateProjectDTO;
			const user = req.user?.id;

			const dbResult = await this.projectService.createProject(dto, user || "");
			if (!dbResult) {
				throw new AppError(PROJECT_ERRORS.CREATE_FAILED, STATUS_CODES.INTERNAL_SERVER_ERROR);
			}
			const response = ProjectMapper.toProjectResponse(dbResult, "full");

			res.status(STATUS_CODES.CREATED).json(response);
		} catch (error) {
			next(error);
		}
	}
	async getAllProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const query = req.validatedQuery as unknown as QueryProjectDTO;
			const result = await this.projectService.getAllProjects(userId, query);
			const response = ProjectMapper.toProjectsResponse(
				result.projects,
				result.total,
				query.page,
				query.limit,
				query.full ? "full" : "overview",
			);

			res.status(STATUS_CODES.OK).json(response);
		} catch (err) {
			next(err);
		}
	}
	async getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const projectId = req.params.projectId;
			const include = req.query.include as string;

			const result = await this.projectService.getProjectById(projectId, userId, include);
			if (!result) {
				res.status(STATUS_CODES.NOT_FOUND).json({ project: null });
				return;
			}
			const response = ProjectMapper.toProjectResponse(result, "overview");
			res.status(STATUS_CODES.OK).json(response);
		} catch (err) {
			next(err);
		}
	}
	async getProjectComplete(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const projectId = req.params.projectId;
			const include = req.query.include as string;

			const result = await this.projectService.getProjectById(projectId, userId, include, true);
			if (!result) {
				res.status(STATUS_CODES.NOT_FOUND).json({ project: null });
				return;
			}
			const response = ProjectMapper.toProjectResponse(result, "full");
			res.status(STATUS_CODES.OK).json(response);
		} catch (err) {
			next(err);
		}
	}

	async getProjectSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const projectId = req.params.projectId;
			const include = req.query.include as string;

			const result = await this.projectService.getProjectSettings(projectId, userId, include);
			if (!result) {
				res.status(STATUS_CODES.NOT_FOUND).json({ project: null });
				return;
			}
			const response = ProjectMapper.toProjectResponse(result, "setting");
			res.status(STATUS_CODES.OK).json(response);
		} catch (err) {
			next(err);
		}
	}
	async updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const projectId = req.params.projectId;
			const dto = req.validatedBody as UpdateProjectDTO;

			const result = await this.projectService.updateProject(projectId, userId, dto);
			if (!result) {
				res.status(STATUS_CODES.NOT_FOUND).json({ project: null });
				return;
			}
			const response = ProjectMapper.toProjectResponse(result, "update");
			res.status(STATUS_CODES.OK).json(response);
		} catch (err) {
			next(err);
		}
	}
	async updateSubdomain(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const dto = req.validatedBody as UpdateSubdomainDTO;
			const updatedProject = await this.projectService.changeProjectSubdomain(userId, dto.projectId, dto.newSubdomain);
			if (!updatedProject) {
				res.status(STATUS_CODES.NOT_FOUND).json({ project: null });
				return;
			}
			const response = ProjectMapper.toProjectResponse(updatedProject, "update");
			res.status(STATUS_CODES.OK).json(response);
		} catch (error) {
			next(error);
		}
	}
	async checkSubdomainAvailable(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const dto = req.validatedQuery as checkSubdomainDTO;
			const result = await this.projectService.checkSubdomainAvaiable(dto.value);
			res.json({ available: result });
		} catch (error) {
			next(error);
		}
	}
	async changeCurrentDeployment(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const dto = req.validatedBody as ProjectDeploymentUpdateDTO;
			const userId = req.user?.id as string;
			const projectId = req.params.projectId;
			const updatedProject = await this.projectService.changeProjectDeployment(userId, projectId, dto.newCurrentDeployment);
			if (!updatedProject) {
				res.status(STATUS_CODES.NOT_FOUND).json({ project: null });
				return;
			}
			const response = ProjectMapper.toProjectResponse(updatedProject, "update");
			res.status(STATUS_CODES.OK).json(response);
		} catch (error) {
			next(error);
		}
	}

	async getProjectSimpleStats(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const projectId = req.params.projectId;

			const stats = await this.projectService.findProjectSimpleStats(userId, projectId);
			res.status(STATUS_CODES.OK).json({ stats });
		} catch (error) {
			next(error);
		}
	}
	async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const projectId = req.params.projectId;

			const result = await this.projectService.deleteProject(projectId, userId);
			console.log(result);

			res.status(STATUS_CODES.NO_CONTENT).json({ deleted: result });
		} catch (err) {
			next(err);
		}
	}
	async __getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const projectId = req.params.id;
			const project = await this.projectService.__getProjectById(projectId);
			if (project) {
				const response = ProjectMapper.toProjectResponse(project, "full");
				res.json(response);
				return;
			}
			res.json({ project: null });
		} catch (error) {
			next(error);
		}
	}
}

export default ProjectController;
