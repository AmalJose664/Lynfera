import { PassportStatic } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { googleLoginStrategy } from "../../controllers/authController.js";
import { ENVS } from "@/config/env.config.js";

const googleLogin = (passport: PassportStatic) => {
	passport.use(
		new GoogleStrategy(
			{
				clientID: ENVS.GOOGLE_CLIENT_ID as string,
				clientSecret: ENVS.GOOGLE_CLIENT_SECRET as string,
				callbackURL: `${ENVS.API_ENDPOINT}/api/auth/google/callback`,
			},
			googleLoginStrategy,
		),
	);
};

export default googleLogin;
