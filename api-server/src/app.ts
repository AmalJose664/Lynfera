import express, { Request } from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";

import passport from "passport";
import "./config/passport.js";
import connectDB from "./config/mongo.config.js";
import { errorHandler } from "./middlewares/globalErrorHandler.js";
import { corsOptions } from "./config/cors.config.js";

import { STRIPE_WEBHOOK_REQ_PATH } from "./constants/paths.js";
import baseRouter from "./routes/base.route.js";
import { apiRouter } from "./routes/index.js";
import generateAllRouteLogs from "./utils/generateAllRouteLogs.js";




const app = express();
const httpServer = createServer(app);

app.use(cors(corsOptions));

app.use(STRIPE_WEBHOOK_REQ_PATH, express.raw({ type: "application/json" }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use((req: Request, res: any, next: any) => {
	generateAllRouteLogs(req)
	next();
});

app.use('/api', apiRouter);
app.get("/", baseRouter);

app.use(errorHandler);

connectDB();
export default httpServer;
