"use client";
import { FcGoogle, } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { GoogleLoginButton } from '../components/GoogleLogin';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeSwitcher from '@/components/ThemeIcon';
import TitleWithLogo from '@/components/TitleWithLogo';
import { GithubLoginButton } from '../components/GithubLogin';
import { MdOutlineEmail } from "react-icons/md";
import { AnimatePresence, motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { IoCloseSharp } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { LoginSchema, LoginUserType } from "@/lib/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import OtpModal from "@/components/modals/OtpModal";


export default function LoginPage() {
	const router = useRouter();
	const [toggleEmail, setToggleEmail] = useState(false)
	useEffect(() => {
		const verifySessionCode = () => {
			localStorage.clear()
		}
		verifySessionCode()
	}, [router]);
	return (<>
		<div className="relative min-h-screen flex items-center justify-center p-3">

			<div className="absolute top-8 left-8 ">
				<Link href="/" className=' hover:no-underline'>
					<TitleWithLogo useSvg />
				</Link>
			</div>
			<div className="absolute top-8 right-8">
				<span className="font-bold text-primary"><ThemeSwitcher className='' /></span>

			</div>


			<div className={cn("w-full p-8 space-y-8 rounded-lg -mt-5", toggleEmail ? "max-w-xl" : "max-w-md", "transition-all")}>
				<div className="text-center">
					<h1 className="text-4xl font-bold text-primary mb-4">
						Log In
					</h1>
					<p className="text-primary">
						Sign in to continue to your account.
					</p>
				</div>

				<div className="overflow-y-hidden">
					<AnimatePresence mode="wait">
						{!toggleEmail ? (<motion.div key="buttons" animate={{ y: 0 }} exit={{ y: -300 }} initial={{ y: 0 }} transition={{ duration: .8, ease: "backInOut" }} >
							<div className="mt-8 group">
								<GoogleLoginButton
									className="dark:bg-background  bg-white dark:hover:bg-gray-200  hover:bg-gray-800 border-zinc-300 dark:border-zinc-600 
							hover:border-zinc-500
						w-full inline-flex items-center justify-center px-4 py-3 border font-semibold rounded-lg shadow-md transition-colors duration-100 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 !transition-none"
								>
									<FcGoogle className="mr-2" />
									<span
										className="text-primary dark:group-hover:text-black group-hover:text-white"
									>
										Sign in with Google
									</span>
								</GoogleLoginButton>
							</div>
							<div className="mt-8 group">
								<GithubLoginButton
									className="dark:bg-background  bg-white dark:hover:bg-gray-200  hover:bg-gray-800 border-zinc-300 dark:border-zinc-600 
							hover:border-zinc-500   w-full inline-flex items-center justify-center px-4 py-3 border font-semibold rounded-lg shadow-md transition-colors duration-100 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 !transition-none"
								>
									<FaGithub className='mr-2 text-primary dark:group-hover:text-black group-hover:text-white' />
									<span className="text-primary dark:group-hover:text-black group-hover:text-white"
									>
										Sign in with Github</span>
								</GithubLoginButton>
							</div>


							<div className="mt-8 group">
								<button onClick={() => setToggleEmail(true)} className="dark:bg-background  bg-white dark:hover:bg-gray-200  hover:bg-gray-800 border-zinc-300 dark:border-zinc-600 
						hover:border-zinc-500   w-full inline-flex items-center justify-center px-4 py-3 border font-semibold rounded-lg shadow-md transition-colors duration-100 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 !transition-none">
									<MdOutlineEmail className='mr-2 text-primary dark:group-hover:text-black group-hover:text-white' />
									<span className="text-primary dark:group-hover:text-black group-hover:text-white"
									>
										Sign in with Email</span>
								</button>
							</div>
						</motion.div>
						)
							: <EmailMethodBox setToggleEmail={setToggleEmail} key={"inputs"} />
						}
					</AnimatePresence>
				</div>
				<div className="mt-12 flex items-center justify-between flex-col text-some-less">
					No account yet?
					<Link href={"/signup"} className='m-auto mt-2 text-blue-400 hover:underline'>
						Sign up
					</Link>
				</div>
			</div>
		</div></>
	);
}

function EmailMethodBox({ setToggleEmail }: { setToggleEmail: Dispatch<SetStateAction<boolean>> }) {

	const [showPass, setShowPass] = useState(false)
	const [showOtpForm, setShowOtpForm] = useState(false)
	const [error, setError] = useState<string | null>()
	const form = useForm<LoginUserType>({
		defaultValues: {
			email: "",
			password: ""
		},
		resolver: zodResolver(LoginSchema)
	})
	const { register, handleSubmit, formState: { errors, isSubmitting } } = form
	const email = form.getValues("email")
	const router = useRouter()
	const requiredVerification = useRef(false)
	const onSubmit = async (data: LoginUserType) => {
		try {
			const result = await axiosInstance.post("/auth/login", data) as unknown as any
			console.log(result)
			setError(null)
			if (result.data.loginSuccess) {
				router.push("/auth/success")
			}


		} catch (error: any) {
			console.log("Error!", error)
			setError(error.response.data.message)
			if (error.status === 403 && error.response.data.requiresOtpVerification) {
				setShowOtpForm(true)
				requiredVerification.current = true
				return
			}
			if (error.status === 400) {
				return toast.error('Login Failed Invalid input')
			}
			toast.error('Login Failed; Error on login')
		}
	}
	return (
		<motion.div key={"inputs-component"} animate={{ y: 0 }} exit={{ y: 400 }} initial={{ y: 400 }} transition={{ duration: .7, ease: "backInOut" }}>
			<div className="border rounded-md px-3 py-2">
				{showOtpForm && (
					<OtpModal setShowOtpForm={setShowOtpForm} showOtpForm={showOtpForm} userEmail={email} />
				)}



				<button onClick={() => setToggleEmail(false)} className="float-end">
					<IoCloseSharp className="size-5" />
				</button>
				<form action="#" noValidate onSubmit={handleSubmit(onSubmit)}>

					<div className="mt-2">
						<label htmlFor="" className="text-sm">Email</label>
						<Input {...register("email")} placeholder="Oliver@Jhonson.com" className="mt-1 mb-3" />
						{errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
					</div>


					<div className="mt-2">
						<label htmlFor="" className="text-sm">Password</label>
						<div className="relative">
							<Input {...register("password")} type={showPass ? "text" : "password"} placeholder="super secret" className="mt-1 mb-3 pr-9" />
							{showPass
								? <FiEye onClick={() => setShowPass(!showPass)} className="absolute right-4 top-3" />
								: <FiEyeOff onClick={() => setShowPass(!showPass)} className="absolute right-4 top-3" />
							}
						</div>
						{errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
					</div>

					<div className="flex items-center gap-4">
						{error && <div className="mt-2">
							<p className="text-sm text-red-400">{error}</p>
						</div>}

						{requiredVerification.current && <div className="mt-2">
							<button type="button" className="text-sm border px-4 py-2 rounded-md" onClick={(e) => {
								e.stopPropagation()
								e.preventDefault()
								setShowOtpForm(true)
							}}>Verify</button>
						</div>}
					</div>

					<div className="group mt-8">
						<button type="submit" disabled={isSubmitting} className="dark:bg-background bg-white dark:hover:bg-gray-200  hover:bg-gray-800 border-zinc-300 dark:border-zinc-600 
						hover:border-zinc-500   w-full inline-flex items-center justify-center px-4 py-3 border font-semibold rounded-lg shadow-md transition-colors duration-100 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 !transition-none">
							<MdOutlineEmail className='mr-2 text-primary dark:group-hover:text-black group-hover:text-white' />
							<span className="text-primary text-sm dark:group-hover:text-black group-hover:text-white"
							>
								{isSubmitting ? "Loading..." : "Log In"}</span>
						</button>
					</div>

				</form>
			</div>
		</motion.div>
	)
}