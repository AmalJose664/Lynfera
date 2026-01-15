import { NextFunction, Request, Response } from "express";
import z from "zod";

import AppError from "@/utils/AppError.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { COMMON_ERRORS } from "@/constants/errors.js";

type source = "body" | "query";

export function validateRequest<T extends z.ZodObject>(schema: T, source: source) {
	return (req: Request, res: Response, next: NextFunction) => {
		const { body, query } = req;
		const result = schema.safeParse(source === "body" ? body : query);

		if (result.error || !result.success) {
			const messages = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
			console.log("validation error zod ");
			next(new AppError(COMMON_ERRORS.VALIDATION_ERRORS(messages, source), STATUS_CODES.BAD_REQUEST, result.error));
			return;
		}

		if (source === "body") {
			req.validatedBody = result.data;
		} else {
			req.validatedQuery = result.data as any;
		}
		next();
	};
}

export function validateBody<T extends z.ZodObject>(schema: T) {
	return validateRequest(schema, "body");
}
export function validateQuery<T extends z.ZodObject>(schema: T) {
	return validateRequest(schema, "query");
}
