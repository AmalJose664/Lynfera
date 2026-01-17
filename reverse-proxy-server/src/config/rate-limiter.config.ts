import { Options } from "express-rate-limit";
export const baseRateLimit: Partial<Options> = {
	standardHeaders: true,
	windowMs: 60 * 1000,
	max: 100,
	legacyHeaders: false,
	handler: (req, res) => {
		res.status(429).json({
			success: false,
			message: "Too many requests; please try again later"
		});
	},
};
