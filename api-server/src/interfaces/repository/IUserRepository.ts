import { Types } from "mongoose";

import { IUser } from "@/models/User.js";
import { IPlans } from "@/constants/plan.js";
export type SimpleOptions = {
	fillPass: boolean;
};
export type GithubIds = { installId: number, loginId: number }
export type GithubIdsOutput = { githubInstallationId: number, githubAccountId: number }

export interface IUserRepository {
	createUser(data: Partial<IUser>): Promise<IUser>;
	findByUserEmail(email: string, options?: SimpleOptions): Promise<IUser | null>;
	findByUserId(id: string): Promise<IUser | null>;
	incrementProjects(userId: Types.ObjectId | string): Promise<void>;
	decrementProjects(userId: Types.ObjectId | string): Promise<void>;
	updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null>;
	updateUserPlansWithStripe(stripeId: string, planData: keyof IPlans, paymentData: IUser["payment"]): Promise<IUser | null>;
	updateUserPlans(userId: string, planData: keyof IPlans): Promise<IUser | null>;
	getOrUpdateDeployments(userId: string): Promise<IUser | null>;
	findUserByCustomerId(id: string): Promise<IUser | null>;
	incrementDeployment(userId: string): Promise<void>;

	findAuthProviders(userId: string): Promise<Partial<IUser> | null>

	addGhbApCreds(userId: string, updateData: { installId: number, loginId: number }): Promise<GithubIdsOutput | null>
	removeGhbApCreds(installationId: number): Promise<void>
	findGhbApCreds(userId: string): Promise<GithubIdsOutput | null>
}
