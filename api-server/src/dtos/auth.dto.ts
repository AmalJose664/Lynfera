import z from "zod";

export const SignUpSchema = z.object({
	name: z.string().min(3).max(30),
	email: z.email(),
	password: z.string().min(8).max(64).regex(/\d/, "Password must contain at least one number"),
});

export const LoginSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
});
export const VerifyOtpSchema = z.object({
	email: z.email(),
	otp: z.number().min(6),
});
export const ResendOtpSchema = z.object({
	email: z.email(),
});

export type SignUpUserDTO = z.infer<typeof SignUpSchema>;
export type LoginUserDTO = z.infer<typeof LoginSchema>;
export type VerifyOtpDTO = z.infer<typeof VerifyOtpSchema>;
export type ResendOtpDTO = z.infer<typeof ResendOtpSchema>;
