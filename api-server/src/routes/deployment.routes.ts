import { Router } from "express";

import { deploymentController, logsController } from "@/instances.js";
import { authenticateToken } from "@/middlewares/authMiddleware.js";
import { validateQuery } from "@/middlewares/validateRequest.js";
import { DeploymentQueryScheme } from "@/dtos/deployment.dto.js";
import { validateObjectId } from "@/middlewares/validateObjectId.js";

const deploymentRouter = Router();

deploymentRouter.get("/", authenticateToken, validateQuery(DeploymentQueryScheme), deploymentController.getAllDeployments.bind(deploymentController));

deploymentRouter.get(
	"/:deploymentId",
	authenticateToken,
	validateObjectId("deploymentId"),
	deploymentController.getDeployment.bind(deploymentController),
);
deploymentRouter.get(
	"/:deploymentId/files",
	authenticateToken,
	validateObjectId("deploymentId"),
	deploymentController.getDeploymentFilesData.bind(deploymentController),
);

deploymentRouter.get(
	"/:deploymentId/logs",
	authenticateToken,
	validateObjectId("deploymentId"),
	logsController.getLogsByDeployment.bind(logsController),
);
deploymentRouter.get(
	"/:deploymentId/logs/stream",
	authenticateToken,
	validateObjectId("deploymentId"),
	logsController.streamLogs.bind(logsController),
);

export default deploymentRouter;
