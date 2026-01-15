import { Router } from "express";

import { deploymentController, projectController } from "@/instances.js";
import { authenticaContainerteToken } from "@/middlewares/authContainerMiddleware.js";
import { validateObjectId } from "@/middlewares/validateObjectId.js";



const internalRoutes = Router();

internalRoutes.get("/projects/:id", authenticaContainerteToken, validateObjectId("id"), projectController.__getProjects.bind(projectController));

internalRoutes.get(
	"/deployments/:id",
	authenticaContainerteToken,
	validateObjectId("id"),
	deploymentController.__getDeployment.bind(deploymentController),
);

export default internalRoutes;
