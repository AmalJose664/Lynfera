import { NextFunction, Request, Response } from "express";

import { ENVS } from "@/config/env.config.js";
import { USER_ERRORS } from "@/constants/errors.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";

export const authenticaContainerteToken = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers["authorization"]?.split(" ")[1];
	if (!token) {
		console.log("No token");
		return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: USER_ERRORS.NO_TOKEN });
	}
	const server_token = ENVS.CONTAINER_API_TOKEN;

	if (token !== server_token) {
		console.log("Invalid token");
		console.log(server_token, "<<<>>>>", token);
		return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: USER_ERRORS.INVALID_TOKEN });
	}
	next();
};
