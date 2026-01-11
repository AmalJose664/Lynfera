import { NextFunction, Request, Response } from "express";
import { IProject } from "../models/Project.js";
import { projectService } from "../service/project.service.js";
import AppError from "../utils/AppError.js";
import { breaker } from "../utils/CircuitBreaker.js";
import { fileURLToPath } from "url";
import path from "path";
import { deploymentService } from "../service/deployment.service.js";
import { ownDomain, subdomainDelimeter } from "../constants/paths.js";
import { cookieOptions } from "../constants/cookieContanst.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

declare global {
	namespace Express {
		interface Request {
			project?: IProject;
			startTime?: number;
			isManualDeployment: boolean;
			manualDeploymentId?: string
		}
	}
}
export type RequestWithProject = Request & {
	project?: IProject;
	startTime?: number
}

export async function findProjectDplIds(req: Request, res: Response, next: NextFunction) {

	// console.log(req.subdomains, " < < < < <")
	// console.log(req.hostname, " < < < < <")



	try {
		if (breaker.isOpen) {
			next(new AppError("Service temporarily unavailable", 503));
			return
		}
		const hostnameParts = req.hostname.split('.');
		if (hostnameParts.length < 2) {
			res.status(400).json({ error: 'Invalid hostname' });
			return;
		}
		let slug = hostnameParts[0];
		req.isManualDeployment = false
		if (!slug || slug === ownDomain || slug === 'www') {
			res.status(400).json({ error: 'Invalid subdomain' });
			return;
		}

		let deploymentSelectId = null
		let deploymentObj = null
		if (slug.includes(subdomainDelimeter)) {
			req.isManualDeployment = true
			const parts = slug.split(subdomainDelimeter)
			if (parts.length !== 2 || !parts[1]) {
				res.status(400).json({ error: 'Invalid deployment format' });
				return;
			}
			slug = parts[0]
			deploymentSelectId = parts[1]
		}
		const project = await projectService.findProjectBySlug(slug);

		if (!project || project.isDeleted) {
			res.cookie('project_id', JSON.stringify({ _id: project?._id, frontend: process.env.FRONTEND_URL }), cookieOptions)

			res.status(404).sendFile(path.join(__dirname, "../", "views/project404.html"));
			return
		}
		if (project.isDisabled) {
			res.cookie('project_id', JSON.stringify({ _id: project?._id, frontend: process.env.FRONTEND_URL }), cookieOptions);
			res.status(403).sendFile(path.join(__dirname, "../", "views/project-disabled.html"));
			return
		}

		if (!project.currentDeployment && !!project.tempDeployment) {
			res.cookie('project_id', JSON.stringify({ _id: project?._id, frontend: process.env.FRONTEND_URL }), cookieOptions);
			res.status(404).sendFile(path.join(__dirname, "../", "views/project-build.html"));
			res.set('Retry-After', '30');
			return
		}
		if (!project.currentDeployment) {
			res.cookie('project_id', JSON.stringify({ _id: project?._id, frontend: process.env.FRONTEND_URL }), cookieOptions);
			res.status(404).sendFile(path.join(__dirname, "../", "views/no-deployment.html"));
			return
		}

		if (deploymentSelectId) {
			deploymentObj = await deploymentService.findDeploymentByPublicId(deploymentSelectId)
			if (!deploymentObj) {
				res.status(404).json({
					error: 'Deployment not found',
					deploymentId: deploymentSelectId
				});
				return;
			}
			if (deploymentObj.projectId.toString() !== project._id.toString()) {
				res.status(403).json({
					error: 'Deployment does not belong to this project'
				});
				return;
			}
			req.manualDeploymentId = deploymentObj._id
		}


		req.project = project;
		breaker.recordSuccess()
		next();

	} catch (error) {
		if (!(error instanceof AppError)) {
			breaker.recordFailure();
		}
		console.error('Project lookup error:', error);
		next(error);
	}
}
