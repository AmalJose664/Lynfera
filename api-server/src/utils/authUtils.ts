import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken, RefreshTokenOptions } from "./generateToken.js";
import { accessCookieConfig, refreshCookieConfig } from "@/config/cookie.config.js";

export function issueAuthAccessCookies(res: Response, user: Request["user"]) {
	const accessToken = generateAccessToken(user);
	res.cookie("access_token", accessToken, { ...accessCookieConfig });
}

export function issueAuthRefreshCookies(res: Response, user: Request["user"], refreshTokenOptions: RefreshTokenOptions) {
	const refreshToken = generateRefreshToken(user, refreshTokenOptions);
	res.cookie("refresh_token", refreshToken, { ...refreshCookieConfig });
}
export function issueOtherCookies(res: Response) {

	res.cookie("is_Authenticated", "true", { ...accessCookieConfig, httpOnly: false, maxAge: 6 * 60 * 60 * 1000, domain: ".lynfera.qzz.io" });
}
