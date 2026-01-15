import jwt from "jsonwebtoken";

import { ENVS } from "@/config/env.config.js";

export const generateAccessToken = (user: Express.User | undefined) => {
	if (!user) {
		throw new Error("Error creating token");
	}
	const token = jwt.sign(
		{
			id: user?.id,
			plan: user?.plan,
		},
		ENVS.ACCESS_TOKEN_SECRET as string,
		{ expiresIn: ENVS.NODE_ENV === "production" ? "15m" : "2h" },
	);
	return token;
};

export const generateRefreshToken = (user: Express.User | undefined) => {
	if (!user) {
		throw new Error("Error creating token");
	}
	const token = jwt.sign(
		{
			id: user?.id,
			plan: user?.plan,
		},
		ENVS.REFRESH_TOKEN_SECRET as string,
		{ expiresIn: "1d" },
	);
	return token;
};

export const generateOtpToken = (userId: string) => {
	if (!userId) {
		throw new Error("Server error");
	}
	const token = jwt.sign(
		{
			id: userId,
			purpose: "OTP_resend",
		},
		ENVS.VERIFICATION_TOKEN_SECRET as string,
		{ expiresIn: "20m" },
	);
	return token;
};
