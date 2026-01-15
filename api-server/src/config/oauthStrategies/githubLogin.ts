import { PassportStatic } from "passport";
import { Strategy as GithubStategy } from "passport-github2";
import { githubLoginStrategy } from "../../controllers/authController.js";
import { ENVS } from "@/config/env.config.js";

const githubLogin = (passport: PassportStatic) => {
	passport.use(
		new GithubStategy(
			{
				clientID: ENVS.GITHUB_CLIENT_ID as string,
				clientSecret: ENVS.GITHUB_CLIENT_SECRET as string,
				callbackURL: `${ENVS.API_ENDPOINT}/api/auth/github/callback`,
			},
			githubLoginStrategy,
		),
	);
};

export default githubLogin;
