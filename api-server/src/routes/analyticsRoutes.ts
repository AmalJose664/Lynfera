import { analyticsController } from "@/instances.js";
import { authenticateToken } from "@/middlewares/authMiddleware.js";
import { validateObjectId } from "@/middlewares/validateObjectId.js";
import { Router } from "express";

const analyticsRouter = Router();

analyticsRouter.get(
	"/:projectId/bandwidth",
	authenticateToken,
	validateObjectId("projectId"),
	analyticsController.bandWidth.bind(analyticsController),
);
analyticsRouter.get(
	"/:projectId/overview/",
	authenticateToken,
	validateObjectId("projectId"),
	analyticsController.overview.bind(analyticsController),
);
analyticsRouter.get(
	"/:projectId/realtime/",
	authenticateToken,
	validateObjectId("projectId"),
	analyticsController.realtime.bind(analyticsController),
);
analyticsRouter.get(
	"/:projectId/top-pages/",
	authenticateToken,
	validateObjectId("projectId"),
	analyticsController.topPages.bind(analyticsController),
);
analyticsRouter.get("/:projectId/os-stats/", authenticateToken, validateObjectId("projectId"), analyticsController.osStats.bind(analyticsController));

export default analyticsRouter;
