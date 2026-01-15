import mongoose, { Document, Schema, Types } from "mongoose";

import { IPlans } from "@/constants/plan.js";

export enum AuthProvidersList {
	GOOGLE = "google",
	GITHUB = "github",
}
export enum SubscriptionStatus {
	active = "active",
	cancelled = "cancelled",
	none = "none",
}
export interface IUser extends Document {
	_id: string;
	name: string;
	email: string;
	profileImage: string;
	password: string;
	authProviders: { provider: AuthProvidersList; id: string }[];
	plan: keyof IPlans;
	projects: number;
	deploymentsToday: number;
	isVerified: boolean;
	currentDate: string;
	stripeCustomerId?: string;
	payment: {
		subscriptionId: string | null;
		subscriptionStatus: SubscriptionStatus;
	} | null;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new Schema<IUser>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		profileImage: { type: String, required: false, default: "FILL" },
		password: { type: String, default: "", select: false },
		isVerified: { type: Boolean, defaul: false },
		authProviders: [
			{
				provider: { type: String, enum: Object.values(AuthProvidersList) },
				id: { type: String, required: true },
				_id: false,
			},
		],
		plan: { type: String, required: true, default: "FREE" },
		projects: { type: Number, required: true, default: 0 },
		deploymentsToday: { type: Number, required: true, default: 0 },
		stripeCustomerId: { type: String, default: null },
		payment: {
			_id: false,
			subscriptionId: { type: String, default: null },
			subscriptionStatus: {
				type: String,
				enum: Object.values(SubscriptionStatus),
				default: "none",
			},
		},
		currentDate: { type: String, required: true, default: () => new Date().toISOString().slice(0, 10) },
	},
	{ timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);
