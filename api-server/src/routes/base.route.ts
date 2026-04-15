import { getServerNotifications } from "@/controllers/serverDataOnlyController.js";
import { Router } from "express";

const baseRouter = Router();
baseRouter.get("/", (_req, res) => {
	res.status(200).json({
		status: "ok",
		service: "lynfera-backend",
		ip: { reqIp: _req.ip },
	});
	return;
});

baseRouter.get("/health", (_req, res) => {
	res.status(200).json({
		success: true,
		message: "API is healthy",
		timestamp: new Date().toISOString(),
	});
});

baseRouter.get("/server-notifications", getServerNotifications);

export default baseRouter;
