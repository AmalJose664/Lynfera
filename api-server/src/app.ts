import express, { Request } from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import morgan from "morgan";
import helmet from "helmet";

import "./config/passport.js";
import connectDB from "./config/mongo.config.js";
import { errorHandler } from "./middlewares/globalErrorHandler.js";
import { corsOptions } from "./config/cors.config.js";

import { STRIPE_WEBHOOK_REQ_PATH } from "./constants/paths.js";
import baseRouter from "./routes/base.route.js";
import { apiRouter } from "./routes/index.js";

const app = express();
const httpServer = createServer(app);
// app.set('trust proxy', true)
app.use(cors(corsOptions));

app.use(STRIPE_WEBHOOK_REQ_PATH, express.raw({ type: "application/json" }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(helmet())
app.use(passport.initialize());
app.use(morgan("tiny"));

app.use("/api", apiRouter);
app.use("/", baseRouter);

app.use(errorHandler);

connectDB();
export default httpServer;
