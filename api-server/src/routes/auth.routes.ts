import { Router } from "express";
import passport from "passport";

import {
	checkAuth,
	getAuthenticatedUser,
	getAuthenticatedUserDetails,
	loginUser,
	oAuthLoginCallback,
	refresh,
	resendOtp,
	signUpUser,
	userLogout,
	verifyAuth,
	verifyOtp,
} from "@/controllers/authController.js";
import { authenticateToken } from "@/middlewares/authMiddleware.js";
import { validateBody } from "@/middlewares/validateRequest.js";
import { LoginSchema, SignUpSchema, VerifyOtpSchema } from "@/dtos/auth.dto.js";

const authRouter = Router();

authRouter.get("/", authenticateToken, checkAuth);
authRouter.get("/verify", authenticateToken, verifyAuth);

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
authRouter.get("/github", passport.authenticate("github", { scope: ["profile", "email"] }));

authRouter.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }), oAuthLoginCallback);
authRouter.get("/github/callback", passport.authenticate("github", { session: false, failureRedirect: "/login" }), oAuthLoginCallback);

authRouter.post("/refresh", refresh);
authRouter.post("/logout", userLogout);

authRouter.post("/signup", validateBody(SignUpSchema), signUpUser);
authRouter.post("/login", validateBody(LoginSchema), loginUser);
authRouter.post("/verify-otp", validateBody(VerifyOtpSchema), verifyOtp);
authRouter.post("/resend-otp", resendOtp);

authRouter.get("/me", authenticateToken, getAuthenticatedUser);
authRouter.get("/me/full", authenticateToken, getAuthenticatedUserDetails);

export default authRouter;
