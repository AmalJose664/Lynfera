import jwt from "jsonwebtoken";

export const generateAccessToken = (user: Express.User | undefined) => {
	if (!user) {
		throw new Error("Error creating token");
	}
	const token = jwt.sign(
		{
			id: user?.id,
			plan: user?.plan,
		},
		process.env.ACCESS_TOKEN_SECRET as string,
		{ expiresIn: process.env.NODE_ENV === "production" ? "15m" : "2h" },
	);
	return token;
};

export const generateRefreshToken = (user: Express.User | undefined) => {
	if (!user) {
		throw new Error("Error creating token");
	}
	const token = jwt.sign(
		{
			id: user?.id,
			plan: user?.plan,
		},
		process.env.REFRESH_TOKEN_SECRET as string,
		{ expiresIn: "1d" },
	);
	return token;
};

export const generateOtpToken = (userId: string) => {
	if (!userId) {
		throw new Error("Server error");
	}
	const token = jwt.sign(
		{
			id: userId,
			purpose: "OTP_resend"
		},
		process.env.VERIFICATION_TOKEN_SECRET as string,
		{ expiresIn: "20m" },
	);
	return token;
}