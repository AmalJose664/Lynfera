import { Router } from "express";

import { deploymentController, projectController } from "@/instances.js";
import { authenticaContainerToken } from "@/middlewares/authContainerMiddleware.js";
import { validateObjectId } from "@/middlewares/validateObjectId.js";

const internalRoutes = Router();

internalRoutes.get("/projects/:id", authenticaContainerToken, validateObjectId("id"), projectController.__getProjects.bind(projectController));

internalRoutes.get(
	"/deployments/:id",
	authenticaContainerToken,
	validateObjectId("id"),
	deploymentController.__getDeployment.bind(deploymentController),
);

export default internalRoutes;
