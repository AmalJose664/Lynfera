import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { ENVS } from "@/config/env.config.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { USER_ERRORS } from "@/constants/errors.js";
//user

interface DecodedUser {
	id: string;
	plan: string;
}

declare global {
	namespace Express {
		interface User extends DecodedUser { }
		interface Request {
			validatedQuery?: any;
			validatedBody?: any;
		}
	}
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers["authorization"];
	const token = (req.cookies.access_token as string) || (authHeader && authHeader.split(" ")[1]);
	// const token = authHeader && authHeader.split(" ")[1];
	if (!token) {
		res.status(STATUS_CODES.UNAUTHORIZED).json({ message: USER_ERRORS.NO_TOKEN });
		return;
	}
	try {
		const decoded = jwt.verify(token, ENVS.ACCESS_TOKEN_SECRET as string) as DecodedUser;
		req.user = decoded;
		if (!req.user) {
			res.status(STATUS_CODES.UNAUTHORIZED).json({ message: USER_ERRORS.LOGIN_REQUIRED });
			return;
		}
		next();
	} catch (error) {
		console.log(error);
		res.status(STATUS_CODES.UNAUTHORIZED).json({ message: USER_ERRORS.INVALID_TOKEN });
		return;
	}
};
