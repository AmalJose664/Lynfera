import passport from "passport";
import googleLogin from "@/config/oauthStrategies/googleLogin.js";
import githubLogin from "@/config/oauthStrategies/githubLogin.js";
import authenticate from "@/config/oauthStrategies/jwt.js";
googleLogin(passport);
githubLogin(passport);

authenticate(passport);
