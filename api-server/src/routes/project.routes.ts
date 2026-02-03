import { Router } from "express";

import { deploymentController, logsController, projectController } from "@/instances.js";
import { authenticateToken } from "@/middlewares/authMiddleware.js";

import { validateBody, validateQuery } from "@/middlewares/validateRequest.js";
import {
	CreateProjectSchema,
	ProjectDeploymentUpdateSchema,
	ProjectQuerySchema,
	ProjectSubdomainSchema,
	SubdomainQuerySchema,
	UpdateProjectSchema,
} from "@/dtos/project.dto.js";
import { validateObjectId } from "@/middlewares/validateObjectId.js";
import { DeploymentQueryScheme } from "@/dtos/deployment.dto.js";

const projectRouter = Router();

projectRouter.get("/", authenticateToken, validateQuery(ProjectQuerySchema), projectController.getAllProjects.bind(projectController));
projectRouter.post("/", authenticateToken, validateBody(CreateProjectSchema), projectController.createProject.bind(projectController));
projectRouter.get("/total-usage", authenticateToken, projectController.totalUsage.bind(projectController));
projectRouter.get(
	"/subdomain/check",
	authenticateToken,
	validateQuery(SubdomainQuerySchema),
	projectController.checkSubdomainAvailable.bind(projectController),
);
projectRouter.get("/:projectId", authenticateToken, validateObjectId("projectId"), projectController.getProject.bind(projectController));
projectRouter.patch(
	"/:projectId",
	authenticateToken,
	validateObjectId("projectId"),
	validateBody(UpdateProjectSchema),
	projectController.updateProject.bind(projectController),
);
projectRouter.get("/:projectId/full", authenticateToken, validateObjectId("projectId"), projectController.getProjectComplete.bind(projectController));
projectRouter.get(
	"/:projectId/settings",
	authenticateToken,
	validateObjectId("projectId"),
	projectController.getProjectSettings.bind(projectController),
);
projectRouter.patch(
	"/:projectId/subdomain",
	authenticateToken,
	validateObjectId("projectId"),
	validateBody(ProjectSubdomainSchema),
	projectController.updateSubdomain.bind(projectController),
);

projectRouter.delete("/:projectId", authenticateToken, validateObjectId("projectId"), projectController.deleteProject.bind(projectController));

projectRouter.get(
	"/:projectId/simple-stats",
	authenticateToken,
	validateObjectId("projectId"),
	validateQuery(DeploymentQueryScheme),
	projectController.getProjectSimpleStats.bind(projectController),
);

projectRouter.get(
	"/:projectId/deployments",
	authenticateToken,
	validateObjectId("projectId"),
	validateQuery(DeploymentQueryScheme),
	deploymentController.getDeploymentsByProject.bind(deploymentController),
);

projectRouter.patch(
	"/:projectId/deployments",
	authenticateToken,
	validateObjectId("projectId"),
	validateBody(ProjectDeploymentUpdateSchema),
	projectController.changeCurrentDeployment.bind(projectController),
);

projectRouter.post(
	"/:projectId/deployments",
	authenticateToken,
	validateObjectId("projectId"),
	deploymentController.createDeployment.bind(deploymentController),
);
projectRouter.delete(
	"/:projectId/deployments/:deploymentId/",
	authenticateToken,
	validateObjectId("projectId"),
	validateObjectId("deploymentId"),
	deploymentController.deleteDeployment.bind(deploymentController),
);

projectRouter.get("/:projectId/logs", authenticateToken, validateObjectId("projectId"), logsController.getLogsByProject.bind(logsController));

export default projectRouter;
