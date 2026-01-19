"use client"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import RightFadeComponent from "@/components/RightFadeComponent"
import axiosInstance from "@/lib/axios"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"


const Page = () => {
	const router = useRouter()
	const params = useSearchParams()
	const [code, setCode] = useState<string | null>("STANDBY")
	const isNewUser = params.get("newuser") === "true";
	useEffect(() => {
		const verifyLogin = async () => {
			try {
				const codeFromStorage = localStorage.getItem("session_code")
				if (codeFromStorage) {
					router.push("/projects")
					setCode(codeFromStorage)
					console.log("retunred")
					return
				} else {
					setCode(null)
				}
				console.log("calling")
				await axiosInstance.get("/auth");
				console.log("called")
				localStorage.setItem("session_code", Math.random().toString(36).slice(2, 12))
				await new Promise((res) => setTimeout(res, 1000))
				router.push("/projects");
			} catch (error) {
				console.error("User not authenticated", error);
				router.push("/login");
			}
		};
		verifyLogin();
	}, [router]);
	return (
		<div className="flex w-full flex-1 flex-col items-center justify-center px-4 relative mt-10">
			<BackgroundPattern className="opacity-100 absolute top-10/12 " />
			<div className="flex  flex-col items-center gap-6 text-center absolute top-10/12 mt-60">
				<LoadingSpinner size="md" className="duration-300" />
				{code === "STANDBY" && (
					<h3 className="max-w-prose ">
						Loading....
					</h3>
				)}
				{(code && code !== "STANDBY") && (
					<RightFadeComponent>
						<p className="text-base/7 text-less max-w-prose ">
							Redirecting...
						</p>
					</RightFadeComponent>
				)}
				{!code && <>
					<RightFadeComponent>
						<h1 >Loading your account...</h1>
						<p className="text-base/7 text-less max-w-prose ">
							{isNewUser ? "Just a moment while we set things up for you." : "Logging into your account."}
						</p>
					</RightFadeComponent>
				</>
				}

			</div>
		</div>
	)
}

const BackgroundPattern = (props: any) => {
	return (
		< svg
			width="768"
			height="736"
			viewBox="0 0 768 736"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={props.className}
		>
			<mask
				id="mask0_5036_374506"
				style={{ maskType: "alpha" }}
				maskUnits="userSpaceOnUse"
				x="0"
				y="-32"
				width="768"
				height="768"
			>
				<rect
					width="768"
					height="768"
					transform="translate(0 -32)"
					fill="url(#paint0_radial_5036_374506)"
				/>
			</mask>
			<g mask="url(#mask0_5036_374506)">
				<g clipPath="url(#clip0_5036_374506)">
					<g clipPath="url(#clip1_5036_374506)">
						<line x1="0.5" y1="-32" x2="0.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line x1="48.5" y1="-32" x2="48.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line x1="96.5" y1="-32" x2="96.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line x1="144.5" y1="-32" x2="144.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line x1="192.5" y1="-32" x2="192.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line x1="240.5" y1="-32" x2="240.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line x1="288.5" y1="-32" x2="288.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line x1="336.5" y1="-32" x2="336.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line x1="384.5" y1="-32" x2="384.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line x1="432.5" y1="-32" x2="432.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line x1="480.5" y1="-32" x2="480.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line x1="528.5" y1="-32" x2="528.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line x1="576.5" y1="-32" x2="576.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line x1="624.5" y1="-32" x2="624.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line x1="672.5" y1="-32" x2="672.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line x1="720.5" y1="-32" x2="720.5" y2="736" className="dark:stroke-neutral-600 stroke-neutral-400" />
					</g>
					<rect x="0.5" y="-31.5" width="767" height="767" className="dark:stroke-neutral-600 stroke-neutral-400" />
					<g clipPath="url(#clip2_5036_374506)">
						<line y1="15.5" x2="768" y2="15.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line y1="63.5" x2="768" y2="63.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line y1="111.5" x2="768" y2="111.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line y1="159.5" x2="768" y2="159.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line y1="207.5" x2="768" y2="207.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line y1="255.5" x2="768" y2="255.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line y1="303.5" x2="768" y2="303.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line y1="351.5" x2="768" y2="351.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line y1="399.5" x2="768" y2="399.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line y1="447.5" x2="768" y2="447.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line y1="495.5" x2="768" y2="495.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line y1="543.5" x2="768" y2="543.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line y1="591.5" x2="768" y2="591.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line y1="639.5" x2="768" y2="639.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line y1="687.5" x2="768" y2="687.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
						<line y1="735.5" x2="768" y2="735.5" className="dark:stroke-neutral-600 stroke-neutral-400" />
					</g>
					<rect x="0.5" y="-31.5" width="767" height="767" className="dark:stroke-neutral-600 stroke-neutral-400" />
				</g>
			</g>
			<defs>
				<radialGradient
					id="paint0_radial_5036_374506"
					cx="0"
					cy="0"
					r="1"
					gradientUnits="userSpaceOnUse"
					gradientTransform="translate(384 384) rotate(90) scale(384 384)"
				>
					<stop />
					<stop offset="1" stopOpacity="0" />
				</radialGradient>
				<clipPath id="clip0_5036_374506">
					<rect
						width="768"
						height="768"
						fill="white"
						transform="translate(0 -32)"
					/>
				</clipPath>
				<clipPath id="clip1_5036_374506">
					<rect y="-32" width="768" height="768" fill="white" />
				</clipPath>
				<clipPath id="clip2_5036_374506">
					<rect y="-32" width="768" height="768" fill="white" />
				</clipPath>
			</defs>
		</svg >
	)
}

export default Page