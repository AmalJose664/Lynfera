import { IOtp, OtpPurposes } from "../../models/Otp.js";

export interface IOtpService {
	createNew(userId: string, purpose: OtpPurposes): Promise<{ OtpObject: IOtp, otp: number }>
	verifyOtp(userId: string, otpEntered: number, purpose: OtpPurposes): Promise<boolean>
	getResendOtp(userId: string, purpose: OtpPurposes): Promise<{ OtpObject: IOtp, otp: number }>
	sendOtp(email: string, name: string, otp: number): Promise<Response>
}