import { compare, hash } from "bcrypt"
import { randomInt } from "crypto"


import { IOtpService } from "@/interfaces/service/IOtpService.js";
import { IOtpRepository } from "@/interfaces/repository/IOtpRepository.js";
import { IOtp, OtpPurposes } from "@/models/Otp.js";
import AppError from "@/utils/AppError.js";
import { otpEmailTemplate, sendEmail } from "@/utils/email.js";
import { EMAIL_SENDER } from "@/config/email.config.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { OTP_ERRORS } from "@/constants/errors.js";



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
			throw new AppError(OTP_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		if (savedOtp.expiresAt < new Date()) {
			throw new AppError(OTP_ERRORS.EXPIRED, STATUS_CODES.BAD_REQUEST)
		}
		if (savedOtp.attempts >= this.MAX_OTP_ATTEMPTS) {
			throw new AppError(OTP_ERRORS.MAX_ATTEMPTS(this.MAX_OTP_ATTEMPTS), STATUS_CODES.TOO_MANY_REQUESTS)
		}
		const isMatch = await compare(otpEntered.toString(), savedOtp.otpHash);
		if (!isMatch) {
			await this.otpRepository.updateOtp(userId, purpose, { attempts: savedOtp.attempts + 1 })
			throw new AppError(OTP_ERRORS.INVALID_OTP, STATUS_CODES.BAD_REQUEST);
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
			throw new AppError(OTP_ERRORS.RESEND_LIMIT, STATUS_CODES.TOO_MANY_REQUESTS)
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
			throw new AppError(OTP_ERRORS.COOLDOWN_ACTIVE(waitTime), STATUS_CODES.TOO_MANY_REQUESTS)
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
			throw new AppError(OTP_ERRORS.SEND_FAILED, STATUS_CODES.INTERNAL_SERVER_ERROR);
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