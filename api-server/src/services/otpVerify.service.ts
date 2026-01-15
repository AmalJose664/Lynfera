import { compare, hash } from "bcrypt"
import { randomInt } from "crypto"


import { IOtpService } from "@/interfaces/service/IOtpService.js";
import { IOtpRepository } from "@/interfaces/repository/IOtpRepository.js";
import { IOtp, OtpPurposes } from "@/models/Otp.js";
import AppError from "@/utils/AppError.js";
import { otpEmailTemplate, sendEmail } from "@/utils/email.js";
import { EMAIL_SENDER } from "@/config/email.config.js";



class OtpService implements IOtpService {
	private otpRepository: IOtpRepository;
	otpValidity = 10 * 60 * 1000
	MAX_OTP_ATTEMPTS = 3
	MAX_OTP_RESENTS = 3
	constructor(otpRepo: IOtpRepository) {
		this.otpRepository = otpRepo
	}
	async createNew(userId: string, purpose: OtpPurposes): Promise<{ OtpObject: IOtp, otp: number }> {
		const otp = randomInt(100000, 999999)
		const otpHash = await hash(otp.toString(), 10)

		const otpData = await this.otpRepository.createOtp(
			{
				userId, otpHash, purpose,
				expiresAt: new Date(Date.now() + this.otpValidity),
				attempts: 0, resentCount: 0
			}
		)
		return { OtpObject: otpData, otp }
	}

	async verifyOtp(userId: string, otpEntered: number, purpose: OtpPurposes): Promise<boolean> {
		const savedOtp = await this.otpRepository.getOtp(userId, purpose)
		if (!savedOtp) {
			throw new AppError("No otp was found", 404)
		}
		if (savedOtp.expiresAt < new Date()) {
			throw new AppError("Otp Expired", 400)
		}
		if (savedOtp.attempts >= this.MAX_OTP_ATTEMPTS) {
			throw new AppError("Otp Max attempts reached; Please try again after some time", 400)
		}
		const isMatch = await compare(otpEntered.toString(), savedOtp.otpHash);
		if (!isMatch) {
			await this.otpRepository.updateOtp(userId, purpose, { attempts: savedOtp.attempts + 1 })
			throw new AppError("Otp Wrong", 400)
		}
		await this.otpRepository.deleteOtp(userId, purpose)
		return true
	}

	async getResendOtp(userId: string, purpose: OtpPurposes): Promise<{ OtpObject: IOtp, otp: number }> {
		const oldOtp = await this.otpRepository.getOtp(userId, purpose)

		if (!oldOtp) {
			return this.createNew(userId, purpose);
		}
		if (oldOtp.resentCount >= this.MAX_OTP_RESENTS) {
			throw new AppError("Otp resend limit reached; Please try again after 20 minutes", 429);
		}
		const now = Date.now();
		const latestTime = Math.max(
			oldOtp.createdAt.getTime(),
			oldOtp.updatedAt.getTime()
		);
		const diffInSeconds = Math.floor((now - latestTime) / 1000);

		const COOLDOWN_SECONDS = 60;
		if (diffInSeconds < COOLDOWN_SECONDS) {
			const waitTime = COOLDOWN_SECONDS - diffInSeconds;
			throw new AppError(
				`Please wait ${waitTime} seconds before requesting a new OTP`,
				429
			);
		}

		const newOtp = randomInt(100000, 999999)
		const newOtpHash = await hash(newOtp.toString(), 10)
		const newUpdated = await this.otpRepository.updateOtp(userId, purpose, {
			otpHash: newOtpHash,
			expiresAt: new Date(Date.now() + this.otpValidity),
			resentCount: oldOtp.resentCount + 1 || 1,
			attempts: 0,
		})
		if (!newUpdated) {
			throw new AppError("Error in providing new OTP", 500);
		}
		return { OtpObject: newUpdated, otp: newOtp }
	}

	async sendOtp(email: string, name: string, otp: number): Promise<Response> {

		const template = otpEmailTemplate({ name, otp });
		const payload = {
			sender: EMAIL_SENDER,
			to: [{ email, name }],
			subject: template.subject,
			textContent: template.text,
			htmlContent: template.html,
		};
		return sendEmail(payload)

	}



}

export default OtpService