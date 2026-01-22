import { cva, VariantProps } from "class-variance-authority"
import { motion } from "motion/react"
import { AiOutlineLoading3Quarters } from "react-icons/ai"

const spinnerVariants = cva(
	"border-4 rounded-full border-t-transparent animate-spin border-primary",
	{
		variants: {
			size: {
				sm: "size-4 border-2",
				md: "size-6 border-4",
				lg: "size-8 border-4",
			},
		},
		defaultVariants: {
			size: "md",
		},
	}
)

interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
	className?: string
}

export const LoadingSpinner = ({ size, className }: LoadingSpinnerProps) => {
	return (
		<div className="flex justify-center items-center ">
			<div className={spinnerVariants({ size, className })} />
		</div>
	)
}

export const LoadingSpinner2 = ({ isLoading, loadingText }: { isLoading: boolean, loadingText?: string }) => {
	return (
		<div>{isLoading && (
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
				className="flex gap-6 items-center mb-10 justify-center">
				<p className="text-gray-500 ">{loadingText || "Loading..."}</p>
				<AiOutlineLoading3Quarters className="animate-spin " />
			</motion.div>
		)}</div>

	)
}
export const LoadingSpinner3 = ({ isLoading, loadingText }: { isLoading: boolean, loadingText?: string }) => {
	return (
		<div>{isLoading && (
			<div
				className="flex gap-6 items-center justify-center">
				<p className="text-gray-500 ">{loadingText || "Loading..."}</p>
				<AiOutlineLoading3Quarters className="animate-spin " />
			</div>
		)}</div>

	)
}
export default LoadingSpinner