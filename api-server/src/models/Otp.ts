import mongoose, { Document, Schema, Types } from "mongoose";

export enum OtpPurposes {
	SIGNUP = "SIGNUP",
	RESET_PASSWORD = "RESET_PASSWORD",
	LOGIN = "LOGIN"
}
export interface IOtp extends Document {
	userId: Types.ObjectId | string;
	otpHash: string;
	expiresAt: Date;
	attempts: number;
	resentCount: number;
	purpose: OtpPurposes;
	createdAt: Date;
	updatedAt: Date;
}
const OtpSchema = new Schema<IOtp>(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		otpHash: { type: String, required: true },
		expiresAt: { type: Date, required: true },
		resentCount: { type: Number, default: 0 },
		purpose: {
			type: String,
			enum: Object.values(OtpPurposes),
			required: true,
			default: OtpPurposes.SIGNUP
		},
		attempts: { type: Number, default: 0 }
	}
	,
	{ timestamps: true }
)

export const OtpModel = mongoose.model<IOtp>("OtpVerification", OtpSchema)