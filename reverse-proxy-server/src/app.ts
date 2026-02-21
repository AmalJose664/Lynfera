import express from "express"
import connectDB from "./config/mongo.config.js"
import { proxy } from "./middleware/proxy.js"
import { findProjectDplIds } from "./middleware/projectFinder.js"
import { errorHandler } from "./middleware/globalErrorHandler.js"
import extraRoute from "./routes/routes.js"
import cors from "cors"
import rateLimit from "express-rate-limit"
import { baseRateLimit } from "./config/rate-limiter.config.js"

const app = express()

app.use(rateLimit(baseRateLimit))
app.set('trust proxy', true);
app.use("/extras", cors({
	origin: process.env.FRONTEND_URL,
}),
	extraRoute)
app.use(findProjectDplIds)
app.use(proxy)

app.use(errorHandler);


connectDB()
export default app