
import { COMMON_ERRORS } from "@/constants/errors.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { Options } from "express-rate-limit"
const baseRateLimitConfig: Partial<Options> = {
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		res.status(STATUS_CODES.TOO_MANY_REQUESTS).json({
			success: false,
			message: COMMON_ERRORS.RATE_LIMIT_EXCEEDED,
		});
	},
};



export const dashboardLimiter: Partial<Options> = {
	windowMs: 1 * 60 * 1000,
	max: 100,
	...baseRateLimitConfig
};


export const authLimiter: Partial<Options> = {
	windowMs: 15 * 60 * 1000,
	max: 80,
	...baseRateLimitConfig
};


export const analyticsLimiter: Partial<Options> = {
	windowMs: 1 * 60 * 1000,
	max: 20,
	...baseRateLimitConfig
};


export const logsLimiter: Partial<Options> = {
	windowMs: 1 * 60 * 1000,
	max: 40,
	...baseRateLimitConfig
};


export const deploymentLimiter: Partial<Options> = {
	windowMs: 10 * 60 * 1000,
	max: 40,
	...baseRateLimitConfig
};


export const billingLimiter: Partial<Options> = {
	windowMs: 15 * 60 * 1000,
	max: 40,
	...baseRateLimitConfig
};