import { CookieOptions } from "express";
import { ENVS } from "@/config/env.config.js";

const isProd = ENVS.NODE_ENV === "production";

export const accessCookieConfig: CookieOptions = {
	httpOnly: true,
	secure: isProd,
	sameSite: isProd ? "none" : "lax",
	maxAge: isProd ? 20 * 60 * 1000 : 2 * 60 * 60 * 1000,
};

export const refreshCookieConfig: CookieOptions = {
	httpOnly: true,
	secure: isProd,
	sameSite: isProd ? "none" : "lax",
	maxAge: 24 * 60 * 60 * 1000,
};