import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from "./generateToken.js";
import { accessCookieConfig, refreshCookieConfig } from "@/config/cookie.config.js";


export function issueAuthAccessCookies(res: Response, user: Request['user']) {
	const accessToken = generateAccessToken(user);
	res.cookie("access_token", accessToken, { ...accessCookieConfig });
}




export function issueAuthRefreshCookies(res: Response, user: Request['user']) {
	const refreshToken = generateRefreshToken(user);
	res.cookie("refresh_token", refreshToken, { ...refreshCookieConfig });

}