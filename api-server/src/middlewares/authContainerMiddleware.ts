import { NextFunction, Request, Response } from "express";

import { ENVS } from "@/config/env.config.js";

export const authenticaContainerteToken = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers["authorization"]?.split(" ")[1];
	if (!token) {
		console.log("No token");
		return res.status(401).json({ message: "Project data fetching failed, No container token provided" });
	}
	const server_token = ENVS.CONTAINER_API_TOKEN;

	if (token !== server_token) {
		console.log("Invalid token");
		console.log(server_token, "<<<>>>>", token);

		return res.status(401).json({ message: "Project data fetching failed, Invalid token" });
	}
	next();
};
