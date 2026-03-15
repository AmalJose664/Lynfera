import { LoginUserDTO, SignUpUserDTO } from "@/dtos/auth.dto.js";
import { AuthProvidersList, IUser } from "@/models/User.js";
import { Profile } from "passport";
import { GithubIds, GithubIdsOutput } from "../repository/IUserRepository.js";

export interface IUserSerivce {
	createUser(userData: Partial<IUser>): Promise<IUser>;

	googleLoginStrategy(Profile: Profile): Promise<{ user: IUser; newUser: boolean }>;
	githubLoginStrategy(profile: Profile): Promise<{ user: IUser; newUser: boolean }>;
	updateUser?(userId: string, updateData: Partial<IUser>): Promise<IUser | null>;
	updateUserProfile?(userId: string): Promise<IUser | null>;

	getUser(userId: string): Promise<IUser | null>;
	getUserDetailed(userId: string): Promise<{ user: IUser | null; bandwidth: number }>;

	signUpUser(data: SignUpUserDTO): Promise<{ user: IUser; otpResult: boolean } | null>;
	loginUser(data: LoginUserDTO): Promise<IUser | null>;
	verifyUserOtp(email: string, otp: number): Promise<{ verifyResult: boolean; user: IUser | null }>;
	resentOtp(email: string): Promise<boolean>;

	userCanDeploy(userId: string): Promise<{ user: IUser; limit: number; allowed: boolean; remaining: number }>;
	incrementDeployment(userId: string): Promise<void>;

	getUserAuthProviders(userId: string): Promise<Partial<IUser> | null>


	addGithubInstallationInfo(data: GithubIds, userId: string): Promise<GithubIdsOutput | null>
	removeGithubInstallationInfo(installationId: number): Promise<void>
	getGithubInstallationInfo(userId: string): Promise<GithubIdsOutput | null>

	getUserByGithubInstallation(installationId: number, onlyNeededFields: boolean): Promise<IUser | null>

}
