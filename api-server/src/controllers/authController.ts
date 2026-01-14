import { NextFunction, Request, Response } from "express";
import { Profile, VerifyCallback } from "passport-google-oauth20";

import { HTTP_STATUS_CODE } from "../utils/statusCodes.js";
import jwt from "jsonwebtoken";
import { userService } from "../instances.js";
import { UserMapper } from "../mappers/userMapper.js";
import AppError from "../utils/AppError.js";
import { issueAuthAccessCookies, issueAuthRefreshCookies } from "../utils/authUtils.js";
import { JwtPayload } from "jsonwebtoken";
import { LoginUserDTO, ResendOtpDTO, SignUpUserDTO, VerifyOtpDTO } from "../dtos/auth.dto.js";
import { generateOtpToken } from "../utils/generateToken.js";
import { accessCookieConfig } from "../config/cookie.config.js";
const OTP_COOKIE = "otp_Cookie"
interface RefreshTokenPayload extends JwtPayload {
	id: string;
}



export const oAuthLoginCallback = (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			return next(new AppError("User not authenticated", 401));
		}
		issueAuthAccessCookies(res, req.user)
		issueAuthRefreshCookies(res, req.user)

		const frontend = process.env.FRONTEND_URL + "/auth/success";
		res.redirect(frontend);
	} catch (error) {
		next(new AppError("Error during google callback", 500, error));
	}
};





export const googleLoginStrategy = async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
	console.log("strategy google");
	try {
		const user = await userService.googleLoginStrategy(profile);
		const doneUser = {
			id: user._id,
			plan: user.plan,
		};
		done(null, doneUser);
	} catch (error) {
		done(error, false);
	}
};





export const githubLoginStrategy = async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
	try {
		console.log("strategy github");
		const user = await userService.githubLoginStrategy(profile);
		const doneUser = {
			id: user._id,
			plan: user.plan,
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
		res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ message: "No cookie provided" });
		return;
	}
	try {
		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as RefreshTokenPayload;

		console.log(decoded, "Trying to decode refesh");
		const user = await userService.getUser(decoded.id)
		if (!user) {
			throw new AppError("User not found", 404)
		}
		issueAuthAccessCookies(res, { id: user._id, plan: user.plan })
		return res.status(200).json({ ok: true });
	} catch (error) {
		next(new AppError("Error during token valiadation", 500, error));
		console.log("Error in token valiadation ");
	}
};




export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
	return res.status(200).json({ ok: true, randomNumber: Math.floor(Math.random() * 1000) });
};



export const verifyAuth = (req: Request, res: Response) => {
	return res.status(200).json({ valid: true, user: req.user });
};



export const userLogout = (req: Request, res: Response) => {
	res.clearCookie("refresh_token");
	res.clearCookie("access_token");
	res.status(HTTP_STATUS_CODE.OK).json({ message: "user logged out" });
};





export const getAuthenticatedUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id as string;
		const user = await userService.getUser(userId);
		if (!user) {
			res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ error: "user not found" });
			return;
		}
		const response = UserMapper.toUserResponse(user);
		res.status(HTTP_STATUS_CODE.OK).json(response);
	} catch (error) {
		next(error);
	}
};





export const signUpUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userData = req.validatedBody as SignUpUserDTO
		const result = await userService.signUpUser(userData)

		if (!result) {
			res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: "User Create Error" });
			return;
		}
		const user = result.user
		const otpSent = result.otpResult
		const response = UserMapper.toUserResponse(user);
		res.cookie(OTP_COOKIE, generateOtpToken(response.user._id), { ...accessCookieConfig })
		res.status(HTTP_STATUS_CODE.CREATED).json({ message: "OTP Sent", otpSent, user: response.user });
	} catch (error) {
		next(error)
	}
}






export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userData = req.validatedBody as LoginUserDTO
		const user = await userService.loginUser(userData)
		if (user) {
			const response = UserMapper.toUserResponse(user)
			if (!user.isVerified) {
				res.cookie(OTP_COOKIE, generateOtpToken(response.user._id), { ...accessCookieConfig })
				res.status(HTTP_STATUS_CODE.FORBIDDEN).json({
					message: "Email not verified",
					requiresOtpVerification: true,
					loginSuccess: false
				})
				return
			}
			issueAuthAccessCookies(res, { id: response.user._id, plan: response.user.plan })
			issueAuthRefreshCookies(res, { id: response.user._id, plan: response.user.plan })
			res.status(200).json({ loginSuccess: true, user: response.user })
			return
		}
		res.status(400).json({ message: "User not found", statusCode: 400 })
		return
	} catch (error) {
		next(error)
	}
}





export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userData = req.validatedBody as VerifyOtpDTO
		const result = await userService.verifyUserOtp(userData.email, userData.otp)
		if (result.verifyResult) {
			const { user } = result
			if (user) {
				const response = UserMapper.toUserResponse(user)
				issueAuthAccessCookies(res, { id: response.user._id, plan: response.user.plan })
				issueAuthRefreshCookies(res, { id: response.user._id, plan: response.user.plan })
				res.clearCookie(OTP_COOKIE)
				res.status(HTTP_STATUS_CODE.OK).json({ message: "OTP Verified succesfully", user: response.user });
				return
			}
		}
		res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ message: "Error in otp verificatoin", statusCode: HTTP_STATUS_CODE.BAD_REQUEST });
	} catch (error) {
		next(error)
	}
}





export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const otpCookie = req.cookies.otp_Cookie;
		if (!otpCookie) {
			res.status(400).json({ message: "Cant send otp, insufficient data" })
			return
		}
		const decoded = jwt.verify(otpCookie, process.env.VERIFICATION_TOKEN_SECRET as string) as { id: string };
		const { id } = decoded


		const result = await userService.resentOtp(id || "---")
		res.status(HTTP_STATUS_CODE.OK).json({ message: "OTP Sent", otpsent: result });
	} catch (error) {
		next(error)
	}
}


export const getAuthenticatedUserDetails = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id as string;
		const { user, bandwidth } = await userService.getUserDetailed(userId);
		if (!user) {
			res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ error: "user not found" });
			return;
		}
		const response = UserMapper.toUserDetailedResponse({ user, bandwidth });
		res.status(HTTP_STATUS_CODE.OK).json(response);
	} catch (error) {
		next(error);
	}
};
