import { Request, Response, NextFunction } from "express";

import { ENVS } from "@/config/env.config.js";
import AppError from "@/utils/AppError.js";
import { COMMON_ERRORS } from "@/constants/errors.js";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
	let statusCode = err.statusCode || 500;
	let message = err.message || COMMON_ERRORS.INTERNAL_SERVER;
	console.log("New error 🎉🎉🎉🎉🎉");
	if (err.cause) console.error("Cause: ", err.cause, "\n----------------------------------------------------------------");
	console.log(err);
	if (!(err instanceof AppError)) {
		if (err.code === 11000) {
			const field = Object.keys(err.keyValue)[0];
			message = `${field} already exists`;
			statusCode = 400;
		} else {
			console.error("Unhandled Error:", err);
			message = COMMON_ERRORS.SOMETHING_WENT_WRONG;
		}
	}
	const errorResponse = {
		message,
		statusCode,
		...(ENVS.NODE_ENV === "development" && { stack: err.stack }),
	};
	res.status(statusCode).json(errorResponse);
};
