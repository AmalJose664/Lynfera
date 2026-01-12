"use client";

import { FcGoogle, } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { GoogleLoginButton } from '../components/GoogleLogin';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ThemeSwitcher from '@/components/ThemeIcon';
import TitleWithLogo from '@/components/TitleWithLogo';
import { GithubLoginButton } from '../components/GithubLogin';

export default function LoginPage() {
	const router = useRouter();

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


			<div className="w-full max-w-md p-8 space-y-8 rounded-lg -mt-5">
				<div className="text-center">
					<h1 className="text-4xl font-bold text-primary mb-4">
						Log In
					</h1>
					<p className="text-primary">
						Sign in to continue to your account.
					</p>
				</div>

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
