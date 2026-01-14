"use client"
import { FiUser, FiMail, FiCalendar, FiClock } from 'react-icons/fi';
import { useGetUserDetailedQuery, } from "@/store/services/authApi"

import { IoIosCube, IoMdArrowRoundForward, IoMdCloudDone } from 'react-icons/io';
import { avatarBgFromName, formatBytes, formatDate, getElapsedTimeClean, getPercentage } from '@/lib/moreUtils/combined';
import { MdOutlineStorage } from 'react-icons/md';
import { PLANS } from '@/config/plan';
import { GrPlan } from 'react-icons/gr';
import BackButton from '@/components/BackButton';
import ErrorComponent from '@/components/ErrorComponent';
import { VscAccount } from 'react-icons/vsc';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import RightFadeComponent from '@/components/RightFadeComponent';
import { SubtleProgressBar } from '@/components/SimpleStatsCompnts';



const ProfileContent = () => {
	const { data: userDetailed, error, isError } = useGetUserDetailedQuery()
	const router = useRouter()
	const plan = userDetailed?.plan || "FREE"
	const currentPlan = PLANS[plan]
	if (error || isError) {
		return <ErrorComponent error={error} id={""} field="User" />
	}
	return (
		<div>
			<div className="min-h-screen bg-linear-to-br from-background to-slate-100 dark:from-background dark:to-neutral-900">
				<div className="sticky top-0 z-10 dark:bg-neutral-950/80 backdrop-blur-md">
					<div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3">
						<BackButton />
					</div>
				</div>

				<div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
					<RightFadeComponent className="mb-6 dark:bg-neutral-900 bg-white rounded-md border overflow-hidden shadow-lg">
						<div className="px-8 py-6 flex items-center justify-between">
							<div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
								<div className="relative w-16 h-16">
									{userDetailed?.profileImage === "FILL" ? (
										<span className={`uppercase border text-white rounded-full w-full h-full flex items-center justify-center ${avatarBgFromName(userDetailed.name)}`} >
											{userDetailed.name && userDetailed.name.slice(0, 2)}
										</span>
									) : (
										<img
											src={userDetailed?.profileImage}
											alt={userDetailed?.name || "User Avatar"}
											className="w-16 h-16 rounded-full border-4 shadow-xl bg-transparent"
										/>
									)}
									<div className="absolute bottom-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 "></div>
								</div>

								<div className="flex-1 sm:pt-0">
									<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
										{userDetailed?.name}
									</h1>
								</div>
							</div>
							<button onClick={() => router.push("/user/plan")} className='rounded-md border px-3 py-2 flex gap-2 items-center'>
								<div >
									Manage Plan
								</div>
								<IoMdArrowRoundForward />
								<span
									className={`px-2 py-0.5 rounded-md text-xs font-medium 
										${plan === "PRO" ? "bg-blue-400 text-white" : "bg-gray-300 text-gray-800"}`}
								>
									{plan}
								</span>
							</button>
						</div>
					</RightFadeComponent >

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
						<RightFadeComponent className="dark:bg-neutral-900 bg-white rounded-xl border p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Projects</p>
									<p className="text-xl font-bold text-gray-900 dark:text-white">
										{userDetailed?.projects || 0} / {currentPlan.maxProjects}
									</p>
								</div>
								<div className="w-14 h-14  rounded-xl flex items-center justify-center">
									<IoIosCube className="w-7 h-7 " />
								</div>
							</div>
							{userDetailed && <SubtleProgressBar percentage={getPercentage(userDetailed?.projects || 0, currentPlan.maxProjects)} color="bg-blue-500/80" />}
							{/* {userDetailed && <div className='h-1 w-full bg-gray-500'>
								<div
									style={{ width: getPercentage(userDetailed?.projects || 0, currentPlan.maxProjects) }}
									className="h-1 bg-blue-400">
								</div>
							</div>
							} */}
						</RightFadeComponent>

						<RightFadeComponent delay={.1} className="dark:bg-neutral-900 bg-white rounded-xl border p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Daily Deployments</p>
									<p className="text-xl font-bold text-gray-900 dark:text-white">
										{userDetailed?.deploymentsToday || 0} / {currentPlan.maxDailyDeployments}
									</p>
								</div>
								<div className="w-14 h-14  rounded-xl flex items-center justify-center">
									<IoMdCloudDone className="w-7 h-7 " />
								</div>
							</div>
							{userDetailed && <SubtleProgressBar percentage={getPercentage(userDetailed?.deploymentsToday || 0, currentPlan.maxDailyDeployments)} color="bg-blue-500/80" />}

						</RightFadeComponent >

						<RightFadeComponent delay={.18} className="dark:bg-neutral-900 bg-white rounded-xl border  p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Monthly BandWidth</p>
									<p className="text-xl font-bold text-gray-900 dark:text-white">
										{userDetailed &&
											formatBytes(userDetailed?.bandwidthMonthly || 0)
											+ " / " +
											currentPlan.totalBandwidthGB + "GB"
										}
									</p>
								</div>
								<div className="w-14 h-14  rounded-xl flex items-center justify-center">
									<MdOutlineStorage className="w-7 h-7 " />
								</div>
							</div>

						</RightFadeComponent >
					</div>



					<RightFadeComponent delay={.15} className="mb-4 px-6 py-4 dark:bg-neutral-900 bg-white rounded-md border">
						<div className="p-3 ">
							<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
								Info
							</h3>
							<div className='mb-4 border-b pb-2'>
								<div className="flex gap-6 items-center">
									<span>
										<FiUser className="size-4" />
									</span>
									<div className="">
										<p className="text-xs text-less mb-1">Full Name</p>
										<p className="text-base font-medium text-primary">{userDetailed?.name}</p>
									</div>
								</div>
							</div>
							<div className='mb-4 border-b pb-2'>
								<div className="flex gap-6 items-center">
									<span>
										<FiMail className="size-4" />
									</span>
									<div className="">
										<p className="text-xs text-less mb-1">Email Address</p>
										<p className="text-base font-medium text-primary">{userDetailed?.email}</p>
									</div>
								</div>
							</div>
							<div className='mb-4 border-b pb-2'>
								<div className="flex gap-6 items-center">
									<span>
										<GrPlan className="size-4" />
									</span>
									<div className="">
										<p className="text-xs text-less mb-1">User Plan</p>
										<p className="text-base font-medium text-primary">{userDetailed?.plan || ""}</p>
									</div>
								</div>
							</div>
							<div className='mb-4 border-b pb-2'>
								<div className="flex gap-6 items-center">
									<span>
										<FiCalendar className="size-4" />
									</span>
									<div className="">
										<p className="text-xs text-less mb-1">Joined Date</p>
										<p className="text-base font-medium text-primary">{formatDate(userDetailed?.createdAt)}</p>
									</div>
								</div>
							</div>
							<div className='mb-4 border-b pb-2'>
								<div className="flex gap-6 items-center">
									<span>
										<FiClock className="size-4" />
									</span>
									<div className="">
										<p className="text-xs text-less mb-1">Member Since</p>
										<p className="text-base font-medium text-primary">{getElapsedTimeClean(userDetailed?.createdAt)}</p>
									</div>
								</div>
							</div>
							<div className='mb-4 border-b pb-2'>
								<div className="flex gap-6 items-center">
									<span>
										<VscAccount className="size-4" />
									</span>
									<div className="mb-1">
										<p className="text-xs text-less mb-1">Connected Accounts</p>
										<span className="flex gap-2 items-center">
											{userDetailed?.connectedAccounts.includes("google") && <FaGoogle />}
											{userDetailed?.connectedAccounts.includes("github") && <FaGithub />}
										</span>
									</div>
								</div>
							</div>
						</div>
					</RightFadeComponent >
				</div>
			</div>
		</div >
	)
}
export default ProfileContent
