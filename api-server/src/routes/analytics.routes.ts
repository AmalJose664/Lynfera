import { AnalyticsQuerySchema } from "@/dtos/analytics.dto.js";
import { analyticsController } from "@/instances.js";
import { authenticateToken } from "@/middlewares/authMiddleware.js";
import { validateObjectId } from "@/middlewares/validateObjectId.js";
import { validateQuery } from "@/middlewares/validateRequest.js";
import { Router } from "express";

const analyticsRouter = Router();
analyticsRouter.post("/:projectId/clear-data",
	authenticateToken,
	validateObjectId("projectId"),
	analyticsController.clearAnalytics.bind(analyticsController),
)
analyticsRouter.get(
	"/:projectId/bandwidth",
	authenticateToken,
	validateObjectId("projectId"),
	validateQuery(AnalyticsQuerySchema),
	analyticsController.bandWidth.bind(analyticsController),
);
analyticsRouter.get(
	"/:projectId/overview/",
	authenticateToken,
	validateObjectId("projectId"),
	validateQuery(AnalyticsQuerySchema),
	analyticsController.overview.bind(analyticsController),
);
analyticsRouter.get(
	"/:projectId/realtime/",
	authenticateToken,
	validateObjectId("projectId"),
	validateQuery(AnalyticsQuerySchema),
	analyticsController.realtime.bind(analyticsController),
);
analyticsRouter.get(
	"/:projectId/top-pages/",
	authenticateToken,
	validateObjectId("projectId"),
	validateQuery(AnalyticsQuerySchema),
	analyticsController.topPages.bind(analyticsController),
);
analyticsRouter.get("/:projectId/platform-stats/",
	authenticateToken,
	validateObjectId("projectId"),
	validateQuery(AnalyticsQuerySchema),
	analyticsController.platformStats.bind(analyticsController)
);

export default analyticsRouter;
