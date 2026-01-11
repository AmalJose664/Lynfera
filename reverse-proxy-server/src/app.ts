import express from "express"
import connectDB from "./config/mongo.config.js"
import { proxy } from "./middleware/proxy.js"
import { findProjectDplIds } from "./middleware/projectFinder.js"
import { errorHandler } from "./middleware/globalErrorHandler.js"
import extraRoute from "./routes/routes.js"
import cors from "cors"

const app = express()

app.use((req, res, next) => {
	console.log("proxy_server - >>> ", req.path)
	next()
})

app.use("/extras", cors({
	origin: process.env.FRONTEND_URL,
}),
	extraRoute)
app.use(findProjectDplIds)
app.use(proxy)

app.use(errorHandler);


connectDB()
export default app