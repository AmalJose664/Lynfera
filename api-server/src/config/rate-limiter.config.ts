
import { Options } from "express-rate-limit"
const baseRateLimitConfig: Partial<Options> = {
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		res.status(429).json({
			success: false,
			message: "Too many requests. Try again later.",
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