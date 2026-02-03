import express from "express";

import analyticsRouter from "./analytics.routes.js";
import logsRouter from "./logs.routes.js";
import { analyticsLimiter, authLimiter, billingLimiter, dashboardLimiter, deploymentLimiter, logsLimiter } from "@/config/rate-limiter.config.js";
import deploymentRouter from "./deployment.routes.js";
import projectRouter from "./project.routes.js";
import authRouter from "./auth.routes.js";
import paymentRouter from "./payment.routes.js";
import rateLimit from "express-rate-limit";
import internalRoutes from "./container.routes.js";

export const apiRouter = express.Router();

apiRouter.use("/analytics", rateLimit(analyticsLimiter), analyticsRouter);
apiRouter.use("/logs", rateLimit(logsLimiter), logsRouter);
apiRouter.use("/deployments", rateLimit(deploymentLimiter), deploymentRouter);
apiRouter.use("/projects", rateLimit(dashboardLimiter), projectRouter);
apiRouter.use("/auth", rateLimit(authLimiter), authRouter);
apiRouter.use("/billing", rateLimit(billingLimiter), paymentRouter);

// ------- CONTAINER ROUTES--------------

apiRouter.use("/internal", internalRoutes);

// --------------------------------------
