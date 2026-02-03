import jwt, { JwtPayload } from "jsonwebtoken";

import { ENVS } from "@/config/env.config.js";
import AppError from "./AppError.js";
export interface RefreshTokenOptions {
	currentRefresh?: number;
	originalIssuedAt: number;
}
export type TokenType = JwtPayload & {
	id: string;
	plan: string;
};
export type RefresheTokenType = TokenType & {
	crntRfrshCount: number;
	oIAT: number;
};
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

export const generateRefreshToken = (user: Express.User | undefined, refreshTokenOptions: RefreshTokenOptions) => {
	if (!user) {
		throw new Error("Error creating token");
	}
	if (refreshTokenOptions.currentRefresh && refreshTokenOptions.currentRefresh >= 10) {
		throw new AppError("Max Refreshes; Please login again", 401);
	}
	const token = jwt.sign(
		{
			id: user?.id,
			plan: user?.plan,
			crntRfrshCount: refreshTokenOptions.currentRefresh,
			oIAT: refreshTokenOptions.originalIssuedAt,
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

export function generateTokenContainerAccessToken(projectId: string, deploymentId: string) {
	return jwt.sign(
		{
			sub: "build-container",
			pId: projectId,
			dId: deploymentId,
		},
		ENVS.SERVICE_JWT_SECRET,
		{
			algorithm: "HS256",
			expiresIn: "8m",
		},
	);
}
