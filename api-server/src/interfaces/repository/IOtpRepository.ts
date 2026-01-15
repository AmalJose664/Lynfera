import { IOtp, OtpPurposes } from "@/models/Otp.js";

export interface IOtpRepository {
	createOtp(otpObj: Partial<IOtp>): Promise<IOtp>;
	getOtp(userId: string, purpose: OtpPurposes): Promise<IOtp | null>;
	deleteOtp(userId: string, purpose: OtpPurposes): Promise<number>;
	updateOtp(userId: string, purpose: OtpPurposes, updateData: Partial<IOtp>): Promise<IOtp | null>;
}
