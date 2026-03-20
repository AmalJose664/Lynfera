import { COMMON_ERRORS } from "@/constants/errors.js";
import { redisCacheService } from "@/instances.js";
import AppError from "@/utils/AppError.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { NextFunction, Request, Response } from "express";
export const getServerNotifications = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const data = await redisCacheService.get<string>("server-notifications")
		if (!data) {
			res.status(404).json({ messgae: "Not found" })
			return
		}
		res.status(200).json({ fromServer: data })

	} catch (error: any) {
		console.log(error.message, error)
		next(new AppError(COMMON_ERRORS.SOMETHING_WENT_WRONG, STATUS_CODES.INTERNAL_SERVER_ERROR, error));
	}
};
