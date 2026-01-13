type OtpTemplateParams = {
	name: string;
	otp: number;
};





export async function sendEmail(payload: unknown): Promise<Response> {
	const response = fetch(process.env.OTP_SEND_URL + "", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"api-key": process.env.OTP_SEND_API_KEY!,
		},
		body: JSON.stringify(payload),
	});
	return response;
}


export function otpEmailTemplate({ name, otp }: OtpTemplateParams) {
	return {
		subject: "Verify your email - Lynfera",
		text: `Welcome to Lynfera! Your signup verification code is: ${otp}. This code expires in 10 minutes.`,
		html: `<!DOCTYPE html><html><body style='background-color: #121212; color: #ffffff; font-family: Arial, sans-serif; margin: 0; padding: 0;'><div style='max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center;'><h1 style='color: #bb86fc; font-size: 28px; margin-bottom: 20px;'>Lynfera</h1><div style='background-color: #1e1e1e; padding: 30px; border-radius: 12px; border: 1px solid #333333;'><h2 style='font-size: 20px; margin-bottom: 10px;'>Verify Your Account</h2><p style='color: #b0b0b0; font-size: 16px;'>Welcome to Lynfera! Use the verification code below to complete your signup. This code will expire in 10 minutes.</p><div style='margin: 30px 0;'><span style='background-color: #333333; color: #bb86fc; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px; display: inline-block; border: 1px solid #bb86fc;'>${otp}</span></div><p style='color: #757575; font-size: 14px;'>If you did not request this, please ignore this email.</p></div><div style='margin-top: 30px; color: #757575; font-size: 12px;'><p>&copy; 2026 Lynfera. All rights reserved.</p></div></div></body></html>`,
	};
}


