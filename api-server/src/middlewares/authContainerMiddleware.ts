import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ENVS } from "@/config/env.config.js";
import { USER_ERRORS } from "@/constants/errors.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import AppError from "@/utils/AppError.js";

export const authenticaContainerToken = (req: Request, res: Response, next: NextFunction) => {
	try {
		const serviceToken = req.headers["authorization"]?.split(" ")[1];
		const containerToken = req.headers["x-static-token"];
		if (!containerToken || !serviceToken) {
			console.log("No token");
			return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: USER_ERRORS.NO_TOKEN });
		}

		const decoded = jwt.verify(serviceToken, ENVS.SERVICE_JWT_SECRET) as { pId: string; dId: string };
		console.log(decoded);
		const server_token = ENVS.CONTAINER_API_TOKEN;
		if (containerToken !== server_token) {
			console.log("Invalid container token", containerToken, server_token, containerToken === server_token);
			return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: USER_ERRORS.INVALID_TOKEN, resource: "Container token" });
		}
	} catch (error) {
		next(new AppError("Error while verifying token", 401));
		return;
	}
	next();
};
