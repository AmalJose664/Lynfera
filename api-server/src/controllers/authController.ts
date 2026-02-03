import { NextFunction, Request, Response } from "express";
import { Profile, VerifyCallback } from "passport-google-oauth20";
import jwt from "jsonwebtoken";


import { ENVS } from "@/config/env.config.js";
import AppError from "@/utils/AppError.js";
import { issueAuthAccessCookies, issueAuthRefreshCookies } from "@/utils/authUtils.js";
import { userService } from "@/instances.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { UserMapper } from "@/mappers/userMapper.js";
import { LoginUserDTO, SignUpUserDTO, VerifyOtpDTO } from "@/dtos/auth.dto.js";
import { generateOtpToken, RefresheTokenType } from "@/utils/generateToken.js";
import { accessCookieConfig } from "@/config/cookie.config.js";
import { COMMON_ERRORS, OTP_ERRORS, USER_ERRORS } from "@/constants/errors.js";
import { FRONTEND_REDIRECT_PATH } from "@/constants/paths.js";
import { notify } from "@/utils/notifyOnSignup.js";

const OTP_COOKIE = "otp_Cookie";


export const oAuthLoginCallback = (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			return next(new AppError(USER_ERRORS.NOT_AUTHENTICATED, STATUS_CODES.UNAUTHORIZED));
		}
		issueAuthAccessCookies(res, { id: req.user.id, plan: req.user.plan });
		issueAuthRefreshCookies(res, { id: req.user.id, plan: req.user.plan }, { currentRefresh: 0, originalIssuedAt: Date.now() });
		const frontend = ENVS.FRONTEND_URL + FRONTEND_REDIRECT_PATH + ((req.user as any).newUser ? "?newuser=true" : "");
		// console.log({ frontend, user: req.user })
		if ((req.user as any).newUser) {
			notify((req.user as any).nameString.split("%-%")[0], (req.user as any).nameString.split("%-%")[1], req.socket.remoteAddress || req.ip || "")
		}
		res.redirect(frontend);
	} catch (error) {
		next(new AppError(USER_ERRORS.CALLBACK_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR, error));
	}
};

export const googleLoginStrategy = async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
	console.log("strategy google");
	try {
		const { user, newUser } = await userService.googleLoginStrategy(profile);
		const doneUser = {
			id: user._id,
			plan: user.plan,
			newUser, nameString: `${user.name}%-%${user.email}`
		};
		done(null, doneUser);
	} catch (error) {
		done(error, false);
	}
};

export const githubLoginStrategy = async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
	try {
		console.log("strategy github");
		const { user, newUser } = await userService.githubLoginStrategy(profile);
		const doneUser = {
			id: user._id,
			plan: user.plan,
			newUser
		};
		done(null, doneUser);
	} catch (error) {
		done(error, false);
	}
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
	const refreshToken = req.cookies.refresh_token;
	if (!refreshToken) {
		console.log("No refresh token");
		res.status(STATUS_CODES.UNAUTHORIZED).json({ message: COMMON_ERRORS.COOKIE_NOT_PROVIDED });
		return;
	}
	try {
		const decoded = jwt.verify(refreshToken, ENVS.REFRESH_TOKEN_SECRET as string) as RefresheTokenType;

		console.log("Trying to decode refesh", decoded);
		const user = await userService.getUser(decoded.id);
		if (!user) {
			throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}

		const expiresAt = (decoded.exp as number) * 1000;
		const now = Date.now();
		const hoursLeft = (expiresAt - now) / (1000 * 60 * 60);

		if (hoursLeft < 6 && hoursLeft > 0) {
			console.log("refreshing refresh token also")
			issueAuthRefreshCookies(res, { id: user._id, plan: user.plan }, { currentRefresh: decoded.crntRfrshCount + 1, originalIssuedAt: decoded.oIAT })
		}
		issueAuthAccessCookies(res, { id: user._id, plan: user.plan });
		return res.status(STATUS_CODES.OK).json({ ok: true });

	} catch (error) {
		if (error instanceof AppError) {
			next(error)
			return
		}
		if (error instanceof Error) {
			if (error.name === 'TokenExpiredError') {
				next(new AppError(USER_ERRORS.REFRESH_TOKEN_EXPIRED, STATUS_CODES.UNAUTHORIZED, error));
				return;
			}

			if (error.name === 'JsonWebTokenError') {
				next(new AppError(USER_ERRORS.INVALID_TOKEN, STATUS_CODES.UNAUTHORIZED, error));
				return;
			}
		}
		next(new AppError(COMMON_ERRORS.TOKEN_VALIDATION, STATUS_CODES.INTERNAL_SERVER_ERROR, error));
		console.log("Error in token valiadation ");
	}
};

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
	return res.status(STATUS_CODES.OK).json({ ok: true, randomNumber: Math.floor(Math.random() * 1000) });
};

export const verifyAuth = (req: Request, res: Response) => {
	return res.status(STATUS_CODES.OK).json({ valid: true, user: req.user });
};

export const userLogout = (req: Request, res: Response) => {
	res.clearCookie("refresh_token");
	res.clearCookie("access_token");
	res.status(STATUS_CODES.OK).json({ message: "user logged out" });
};

export const getAuthenticatedUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id as string;
		const user = await userService.getUser(userId);
		if (!user) {
			res.status(STATUS_CODES.NOT_FOUND).json({
				error: USER_ERRORS.NOT_AUTHENTICATED,
				message: USER_ERRORS.NOT_FOUND,
			});
			return;
		}
		const response = UserMapper.toUserResponse(user);
		res.status(STATUS_CODES.OK).json(response);
	} catch (error) {
		next(error);
	}
};

export const signUpUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userData = req.validatedBody as SignUpUserDTO;
		const result = await userService.signUpUser(userData);

		if (!result) {
			res.status(STATUS_CODES.BAD_REQUEST).json({ error: USER_ERRORS.CREATION_ERROR });
			return;
		}
		const user = result.user;
		const otpSent = result.otpResult;
		const response = UserMapper.toUserResponse(user);
		res.cookie(OTP_COOKIE, generateOtpToken(response.user._id), { ...accessCookieConfig });
		res.status(STATUS_CODES.CREATED).json({ message: "OTP Sent", otpSent, user: response.user });
	} catch (error) {
		next(error);
	}
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userData = req.validatedBody as LoginUserDTO;
		const user = await userService.loginUser(userData);
		if (user) {
			const response = UserMapper.toUserResponse(user);
			if (!user.isVerified) {
				res.cookie(OTP_COOKIE, generateOtpToken(response.user._id), { ...accessCookieConfig });
				res.status(STATUS_CODES.FORBIDDEN).json({
					message: USER_ERRORS.EMAIL_NOT_VERIFIED,
					requiresOtpVerification: true,
					loginSuccess: false,
				});
				return;
			}
			issueAuthAccessCookies(res, { id: response.user._id, plan: response.user.plan });
			issueAuthRefreshCookies(res, { id: response.user._id, plan: response.user.plan }, { currentRefresh: 0, originalIssuedAt: Date.now() });
			res.status(STATUS_CODES.OK).json({ loginSuccess: true, user: response.user });
			return;
		}
		res.status(STATUS_CODES.NOT_FOUND).json({ message: USER_ERRORS.NOT_FOUND, statusCode: 404 });
		return;
	} catch (error) {
		next(error);
	}
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userData = req.validatedBody as VerifyOtpDTO;
		const result = await userService.verifyUserOtp(userData.email, userData.otp);
		if (result.verifyResult) {
			const { user } = result;
			if (user) {
				const response = UserMapper.toUserResponse(user);
				issueAuthAccessCookies(res, { id: response.user._id, plan: response.user.plan });
				issueAuthRefreshCookies(res, { id: response.user._id, plan: response.user.plan }, { currentRefresh: 0, originalIssuedAt: Date.now() });
				res.clearCookie(OTP_COOKIE);
				res.status(STATUS_CODES.OK).json({ message: "OTP Verified succesfully", user: response.user });
				notify(user.name, user.email, req.socket.remoteAddress || req.ip || "")
				return;
			}
		}
		res.status(STATUS_CODES.BAD_REQUEST).json({
			message: OTP_ERRORS.VERIFICATION_FAILED,
			statusCode: STATUS_CODES.BAD_REQUEST,
		});
	} catch (error) {
		next(error);
	}
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const otpCookie = req.cookies.otp_Cookie;
		if (!otpCookie) {
			res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Cant send otp, insufficient data" });
			return;
		}
		const decoded = jwt.verify(otpCookie, ENVS.VERIFICATION_TOKEN_SECRET as string) as { id: string };
		const { id } = decoded;

		const result = await userService.resentOtp(id || "---");
		res.status(STATUS_CODES.OK).json({ message: "OTP Sent", otpsent: result });
	} catch (error) {
		next(error);
	}
};

export const getAuthenticatedUserDetails = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id as string;
		const { user, bandwidth } = await userService.getUserDetailed(userId);
		if (!user) {
			res.status(STATUS_CODES.NOT_FOUND).json({ error: USER_ERRORS.NOT_FOUND });
			return;
		}
		const response = UserMapper.toUserDetailedResponse({ user, bandwidth });
		res.status(STATUS_CODES.OK).json(response);
	} catch (error) {
		next(error);
	}
};
