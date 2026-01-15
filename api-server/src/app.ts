import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";

import passport from "passport";
import "./config/passport.js";
import rateLimit from 'express-rate-limit';


import connectDB from "./config/mongo.config.js";
import authRouter from "./routes/authRoutes.js";
import { errorHandler } from "./middlewares/globalErrorHandler.js";
import projectRouter from "./routes/projectRoutes.js";
import deploymentRouter from "./routes/deploymentRoutes.js";
import internalRoutes from "./routes/containerRoutes.js";
import logsRouter from "./routes/logsRoutes.js";
import analyticsRouter from "./routes/analyticsRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import { corsOptions } from "./config/cors.config.js";
import { analyticsLimiter, authLimiter, billingLimiter, dashboardLimiter, deploymentLimiter, logsLimiter } from "./config/rate-limiter.config.js";

const app = express();
const httpServer = createServer(app);

app.use(cors(corsOptions));


app.use("/api/billing/stripe-webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use((req: any, res: any, next: any) => {
	const time = new Date();
	console.log(`\n----${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}----- ${req.path} ------${req.method}`);
	next();
});



app.use("/api/analytics", rateLimit(analyticsLimiter), analyticsRouter);
app.use("/api/logs", rateLimit(logsLimiter), logsRouter);
app.use("/api/deployments", rateLimit(deploymentLimiter), deploymentRouter);
app.use("/api/projects", rateLimit(dashboardLimiter), projectRouter);
app.use("/api/auth", rateLimit(authLimiter), authRouter);
app.use("/api/billing", rateLimit(billingLimiter), paymentRouter);



// ------- CONTAINER ROUTES--------------

app.use("/api/internal", internalRoutes);

// --------------------------------------

app.get("/", (req, res) => {
	console.log(req.headers);
	res.json({ status: "working" });
	return;
});

app.use(errorHandler);

connectDB();
export default httpServer;
