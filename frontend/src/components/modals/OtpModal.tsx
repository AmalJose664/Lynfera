import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import axiosInstance from "@/lib/axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
const OtpModal = ({ userEmail, setShowOtpForm, showOtpForm }: { userEmail: string, showOtpForm: boolean, setShowOtpForm: Dispatch<SetStateAction<boolean>> }) => {
	const [otp, setOtp] = useState<string>("");
	const resentSeconds = 50
	const [resendCountdown, setResendCountdown] = useState(resentSeconds);

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (resendCountdown > 0 && showOtpForm) {
			timer = setInterval(() => setResendCountdown((prev) => prev - 1), 1000);
		}
		return () => clearInterval(timer);
	}, [resendCountdown, showOtpForm]);

	const router = useRouter()
	const handleResendOtp = async () => {
		if (resendCountdown === 0) {
			try {
				const response = await axiosInstance.post("/auth/resend-otp")
				if (response.status === 200) {
					toast.success("OTP resent")
				}
			} catch (error: any) {
				console.log("Error on resent OTP ", error)
				if (error.response.data.message && error.status !== 500) {
					toast.error(error.response.data.message)
					return
				}
				toast.error("Error on sending OTP")
			} finally {
				setResendCountdown(resentSeconds);
			}

		}
	};


	const handleVerify = async () => {
		try {
			if (!userEmail) {
				toast.error("Email not found")
			}
			const response = await axiosInstance.post("/auth/verify-otp", {
				otp: Number(otp),
				email: userEmail
			})
			if (response.status === 200) {
				router.push("/auth/success")
				console.clear()
			}
		} catch (error: any) {
			toast.error(error.response.data.message)
		}
	};
	return (
		<div>
			<Dialog open={showOtpForm} onOpenChange={setShowOtpForm}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold">Verify Identity</DialogTitle>
						<DialogDescription>
							We've sent a 6-digit code to your email. Please enter it below to continue.
							<br />
							Email: {userEmail}
						</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col items-center justify-center gap-6 py-4">
						<InputOTP
							maxLength={6}
							value={otp}
							onChange={(value) => setOtp(prev => /^\d+$/.test(value) ? value : "")}
						>
							<InputOTPGroup>
								<InputOTPSlot index={0} />
								<InputOTPSlot index={1} />
								<InputOTPSlot index={2} />
								<InputOTPSlot index={3} />
								<InputOTPSlot index={4} />
								<InputOTPSlot index={5} />
							</InputOTPGroup>
						</InputOTP>

						<div className="text-sm text-center">
							<p className="text-muted-foreground text-sm">
								Didn't receive the code?{" "}
								<button
									type="button"
									disabled={resendCountdown > 0}
									onClick={handleResendOtp}
									className="font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
								>
									{resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend OTP"}
								</button>
							</p>
						</div>
					</div>

					<DialogFooter className="flex flex-row items-center gap-2 w-full">
						<Button
							variant="ghost"
							onClick={() => setShowOtpForm(false)}
							className="flex-1 sm:flex-none sm:min-w-24"
						>
							Cancel
						</Button>
						<Button
							onClick={handleVerify}
							disabled={otp.length !== 6}
							className="flex-1 sm:flex-none sm:min-w-24"
						>
							Continue
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
export default OtpModal

