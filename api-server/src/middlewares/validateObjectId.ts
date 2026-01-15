import { COMMON_ERRORS } from "@/constants/errors.js";
import AppError from "@/utils/AppError.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";



export const validateObjectId = (parameter: string) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const id = req.params[parameter];
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return next(new AppError(COMMON_ERRORS.INVALID_ID(id), STATUS_CODES.BAD_REQUEST));
		}
		next();
	};
};
