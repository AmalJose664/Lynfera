import { IOtp, OtpModel, OtpPurposes } from "@/models/Otp.js"
import { BaseRepository } from "./base/base.repository.js"
import { IOtpRepository } from "@/interfaces/repository/IOtpRepository.js"


class OtpRepository extends BaseRepository<IOtp> implements IOtpRepository {
	constructor() {
		super(OtpModel)
	}
	async createOtp(otpObj: Partial<IOtp>): Promise<IOtp> {
		const otp = new OtpModel(otpObj)
		await otp.save()
		return otp
	}
	async getOtp(userId: string, purpose: OtpPurposes): Promise<IOtp | null> {
		return OtpModel.findOne({ userId, purpose, }).sort("-createdAt")
	}
	async deleteOtp(userId: string, purpose: OtpPurposes): Promise<number> {
		return (await OtpModel.deleteOne({ userId, purpose })).deletedCount
	}
	async updateOtp(userId: string, purpose: OtpPurposes, updateData: Partial<IOtp>): Promise<IOtp | null> {
		return await OtpModel.findOneAndUpdate({ userId, purpose }, updateData, { new: true })
	}
}


export default OtpRepository