import { Profile } from "passport";
import { IUserRepository } from "../interfaces/repository/IUserRepository.js";
import { IUserSerivce } from "../interfaces/service/IUserService.js";
import { AuthProvidersList, IUser } from "../models/User.js";
import AppError from "../utils/AppError.js";
import { IProjectService } from "../interfaces/service/IProjectService.js";
import { PLANS } from "../constants/plan.js";
import { LoginUserDTO, SignUpUserDTO } from "../dtos/auth.dto.js";
import { IOtpService } from "../interfaces/service/IOtpService.js";
import { OtpPurposes } from "../models/Otp.js";
import { compare, hash } from "bcrypt";
import { HTTP_STATUS_CODE } from "../utils/statusCodes.js";

class UserService implements IUserSerivce {
	private userRepository: IUserRepository;
	private projectService: IProjectService;
	private otpService: IOtpService
	constructor(userRepo: IUserRepository, projectServce: IProjectService, otpService: IOtpService) {
		this.userRepository = userRepo;
		this.projectService = projectServce;
		this.otpService = otpService
	}

	async createUser(userData: Partial<IUser>): Promise<IUser> {
		return await this.userRepository.createUser(userData);
	}

	private async oauthLoginStrategy(profile: Profile, provider: AuthProvidersList): Promise<IUser> {
		console.log(`${provider} login`);

		const { emails } = profile;
		if (emails?.length === 0 || !emails) {
			throw new AppError("User email not found", 400);
		}

		let user = await this.userRepository.findByUserEmail(emails[0].value);
		if (!user) {
			const newUser: Partial<IUser> = {
				name: profile.displayName,
				email: emails[0].value,
				profileImage: profile.photos?.[0].value || "",
				authProviders: [{ provider, id: profile.id }],
				isVerified: true
			};
			user = await this.createUser(newUser);
			console.log("No user found, created new...");
			return user;
		}

		const hasProvider = user.authProviders.some((p) => p.provider === provider);

		if (!hasProvider) {
			user = await this.userRepository.updateUser(user._id, {
				authProviders: [...user.authProviders, { provider, id: profile.id }],
				isVerified: true
			});
		}

		return user as IUser;
	}

	async googleLoginStrategy(profile: Profile): Promise<IUser> {
		return this.oauthLoginStrategy(profile, AuthProvidersList.GOOGLE);
	}

	async githubLoginStrategy(profile: Profile): Promise<IUser> {
		return this.oauthLoginStrategy(profile, AuthProvidersList.GITHUB);
	}

	async getUser(userId: string): Promise<IUser | null> {
		return await this.userRepository.findByUserId(userId);
	}

	async signUpUser(data: SignUpUserDTO): Promise<{ user: IUser, otpResult: boolean } | null> {

		const emailExists = await this.userRepository.findByUserEmail(data.email)
		if (emailExists) {
			throw new AppError("Email not available", 400)
		}

		const hashedPass = await hash(data.password, 10)
		const newUser = await this.userRepository.createUser({
			name: data.name,
			email: data.email,
			password: hashedPass,
			profileImage: "",
			isVerified: false,
			authProviders: [],
			plan: "FREE",
		})

		const otp = await this.otpService.createNew(newUser._id, OtpPurposes.SIGNUP)
		const sendResult = await this.otpService.sendOtp(newUser.email, newUser.name, otp.otp)
		if (!sendResult.ok) {
			throw new AppError("OTP Sent Error", 500)
		}
		const resultData = await sendResult.json()


		console.log(resultData)
		return { user: newUser, otpResult: sendResult.ok }
	}

	async verifyUserOtp(email: string, otp: number): Promise<{ verifyResult: boolean, user: IUser | null }> {
		const user = await this.userRepository.findByUserEmail(email)
		if (!user) {
			throw new AppError("User not found from email", 404)
		}
		if (user.isVerified) {
			throw new AppError("User Already Verified", 409)
		}
		const verifyResult = await this.otpService.verifyOtp(user._id, otp, OtpPurposes.SIGNUP)
		if (!verifyResult) {
			throw new AppError("OTP Verify Error", HTTP_STATUS_CODE.BAD_REQUEST)
		}
		const updatedUser = await this.userRepository.updateUser(user._id, { isVerified: true })
		return { verifyResult: true, user: updatedUser }
	}
	async resentOtp(email: string): Promise<boolean> {
		const t1s = performance.now()
		const user = await this.userRepository.findByUserEmail(email)
		const t1e = performance.now()
		if (!user) {
			throw new AppError("User not found from email", 404)
		}
		if (user.isVerified) {
			throw new AppError("User Already Verified", 409)
		}
		const t2s = performance.now()
		const otp = await this.otpService.getResendOtp(user._id, OtpPurposes.SIGNUP)
		const t2e = performance.now()
		const t3s = performance.now()
		const sendResult = await this.otpService.sendOtp(user.email, user.name, otp.otp)
		if (!sendResult.ok) {
			throw new AppError("OTP Sent Error", 500)
		}
		const resultData = await sendResult.json()
		const t3e = performance.now()
		console.log(" Timers = ", `${(t1e - t1s).toFixed(2)}, - -------  ${(t2e - t2s).toFixed(2)}, -  ------- ${(t3e - t3s).toFixed(2)}`)
		console.log(resultData)
		return sendResult.ok
	}

	async loginUser(data: LoginUserDTO): Promise<IUser | null> {
		const user = await this.userRepository.findByUserEmail(data.email)
		if (!user) {
			throw new AppError("Email or password incorrect", 400)
		}
		const isMatch = compare(data.password, user.password)
		if (!isMatch) {
			throw new AppError("Email or password incorrect", 400)
		}
		return user

	}

	async getUserDetailed(userId: string): Promise<{ user: IUser | null; bandwidth: number }> {
		const [user, bandwidth] = await Promise.all([
			this.userRepository.findByUserId(userId),
			this.projectService.getUserBandwidthData(userId, true),
		]);
		return { user, bandwidth };
	}

	async userCanDeploy(userId: string): Promise<{ user: IUser | null; limit: number; allowed: boolean; remaining: number }> {
		const user = await this.userRepository.getOrUpdateDeployments(userId);
		if (!user) throw new Error("User not found");

		const limit = PLANS[user.plan].maxDailyDeployments;
		const allowed = user.deploymentsToday < limit;
		const remaining = Math.max(0, limit - user.deploymentsToday);

		return { user, limit, allowed, remaining };
	}

	async incrementDeployment(userId: string): Promise<void> {
		await this.userRepository.incrementDeployment(userId);
	}
}

export default UserService;
