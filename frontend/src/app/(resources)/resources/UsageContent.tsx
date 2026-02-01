"use client"

import { LoadingSpinner3 } from "@/components/LoadingSpinner"
import RightFadeComponent from "@/components/RightFadeComponent"
import { SubtleProgressBar } from "@/components/SimpleStatsCompnts"
import { PLANS } from "@/config/plan"
import { formatBytes, formatDuration, getPercentage } from "@/lib/moreUtils/combined"
import { useGetUserDetailedQuery } from "@/store/services/authApi"
import { useGetProjectsQuery, useGetProjectsUsagesQuery } from "@/store/services/projectsApi"
import { Project, ProjectUsageResults } from "@/types/Project"
import Link from "next/link"
import { lazy, Suspense } from "react"
import { IoIosCube, IoMdCloudDone } from "react-icons/io"
import { MdOutlineStorage } from "react-icons/md"
const ChartDailyDeploys = lazy(() => import("@/components/analytics/DailyDeploys"));



const UsagePage = () => {
	const { data: userDetailed, error: userDataError, isError: userDataIsError } = useGetUserDetailedQuery()

	const { data: projects, error: projectsError, isError: projectsIsError } = useGetProjectsQuery({});
	const { data: usagesData, error: usagesError, isError: usagesIsError } = useGetProjectsUsagesQuery()

	const projectsUsage = usagesData?.projects
	const deploys = usagesData?.deploys

	const usagesObj = projectsUsage?.reduce((acc, u) => {
		const { projectId } = u
		if (!acc[projectId]) {
			acc[projectId] = u
		}
		return acc
	}, {} as Record<Project['_id'], ProjectUsageResults>)
	const plan = userDetailed?.plan || "FREE"
	const currentPlan = PLANS[plan]

	const menuItems = [
		{ id: 'project', label: 'overview' },
		{ id: 'usage-stats', label: 'Resource' },
		{ id: 'no-of-builds', label: 'No of Builds' },
	];
	const totalValues = projectsUsage?.reduce((acc, u) => {
		acc.deploys += u.deploys
		acc.total_build += u.total_build
		acc.bandwidthMontly += u.bandwidthMontly
		acc.bandwidthTotal += u.bandwidthTotal
		return acc
	}, {
		deploys: 0,
		total_build: 0,
		bandwidthMontly: 0,
		bandwidthTotal: 0
	})
	return (
		<div className="min-h-screen bg-background  scroll-smooth">
			<div className="max-w-[1380px] mx-auto px-8 py-12">

				<header className="mb-12">
					<h1 className="text-4xl font-bold tracking-tight">Resources & usage</h1>
					<p className="text-less mt-2">Monitor your resource consumption and limits.</p>
				</header>

				<div className="flex flex-col md:flex-row justify-between">
					<aside className="md:w-30 flex-shrink-0">
						<nav className="sticky top-12">
							<ul className="space-y-2">
								{menuItems.map((item) => (
									<li key={item.id} className="border border-transparent dark:hover:border-neutral-700 hover:border-neutral-300 mr-4 rounded-md">
										<a
											href={`#${item.id}`}
											className="block px-4 py-2 text-sm font-medium text-some-less hover:text-primary hover:no-underline rounded-lg transition-colors"
										>
											{item.label}
										</a>
									</li>
								))}
							</ul>
						</nav>
					</aside>

					<main className="flex-1 space-y-12 mt-4">
						{userDataIsError ? (
							<p className="text-red-400">
								Error On Loading user Data
								<br />
								{(userDataError as any).data.message}
							</p>
						) : ""}
						<section id="project" className="scroll-mt-12 border px-4 py-2 rounded-md dark:bg-background bg-white">
							<div>
								<div className="border-b pb-4">
									<h2 className="text-2xl font-semibold">Project</h2>
								</div>
								<div className=" p-8 ">
									<div className="flex gap-1 items-center">
										<p>Review all current projects from the </p><Link href={'/projects'}>Projects page.</Link>
									</div>
									<RightFadeComponent className="rounded-md mt-3 border p-6 dark:shadow-none shadow-md hover:shadow-lg transition-shadow duration-200">
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
									</RightFadeComponent>
								</div>
							</div>
							<div>
								<div className="border-b pb-4">
									<h2 className="text-2xl font-semibold">Deploys</h2>
								</div>
								<div className=" p-8 ">
									<RightFadeComponent delay={.1} className="border p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
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
								</div>
							</div>
							<div>
								<div className="border-b pb-4">
									<h2 className="text-2xl font-semibold">Data Transfers</h2>
								</div>
								<div className=" p-8 ">
									<RightFadeComponent delay={.18} className=" border  p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
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

							</div>
						</section>

						<section id="usage-stats" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-background bg-white">
							<div className="pt-8 px-4 mb-6">
								<h2 className="text-2xl font-semibold tracking-tight text-primary ">Resource Usage</h2>
								<p className="text-sm text-less mt-1">Bandwidth, Deployments, and Build time per project.</p>
							</div>

							<div className="overflow-x-auto dark:bg-background bg-white">
								<table className="w-full text-left border-collapse">
									<thead>
										<tr className="bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800">
											<th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-less">Project Name</th>
											<th id="bandwidth" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-less">Bandwidth Total</th>
											<th id="bandwidthMonthly" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-less">
												Total Bandwidth Monthly
											</th>
											<th id="deploys" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-less text-center">Total Deploys</th>
											<th id="builds" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-less text-right">Total Build Duration</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
										{projects && projects.length !== 0 ? (
											projects.map((project) => {
												const isThisMonth = usagesObj && usagesObj[project._id] && usagesObj[project._id].month === new Date().toISOString().slice(0, 7)
												const bandwidth = usagesObj && usagesObj[project._id]
													? formatBytes(isThisMonth ? usagesObj[project._id].bandwidthTotal : 0)
													: "0 MB"
												const bandwidthMonthly = usagesObj && usagesObj[project._id]
													? formatBytes(isThisMonth ? usagesObj[project._id].bandwidthMontly : 0)
													: "0 MB"
												return (
													(
														<tr key={project._id} className="dark:hover:bg-zinc-900 hover:bg-zinc-50 transition-colors group">
															<td className="px-6 py-5">
																<Link href={"/projects/" + project._id} className="text-sm font-semibold text-some-less group-hover:text-primary transition-colors">
																	{project.name}
																</Link>
															</td>
															<td className="px-6 py-5">
																<span className="text-sm font-mono font-medium text-some-less">
																	{bandwidth}
																</span>
															</td>
															<td className="px-6 py-5">
																<span className="text-sm font-mono font-medium text-some-less">
																	{bandwidthMonthly}
																</span>
															</td>
															<td className="px-6 py-5 text-center">
																<span className="text-sm font-mono font-medium text-some-less">
																	{usagesObj && usagesObj[project._id] ? usagesObj[project._id].deploys : 0}
																</span>
															</td>
															<td className="px-6 py-5 text-right">
																<span className="text-sm font-mono font-medium text-some-less">
																	{usagesObj && usagesObj[project._id] ? formatDuration(usagesObj[project._id].total_build) : "0s"}
																</span>
															</td>
														</tr>
													)
												)
											})

										) : (
											<tr>
												<td colSpan={4} className="py-12 text-center text-sm text-less">
													No resource usage recorded yet.
												</td>
											</tr>
										)}
										{usagesObj && (
											<tr className="dark:hover:bg-zinc-900 hover:bg-zinc-50 dark:bg-neutral-900 bg-neutral-200 transition-colors group">
												<td className="px-6 py-5">
													<p className="text-sm font-semibold text-some-less group-hover:text-primary transition-colors">
														{"Total"}
													</p>
												</td>
												<td className="px-6 py-5">
													<span className="text-sm font-mono font-medium text-some-less">
														{formatBytes(totalValues?.bandwidthTotal || 0)}
													</span>
												</td>
												<td className="px-6 py-5">
													<span className="text-sm font-mono font-medium text-some-less">
														{formatBytes(totalValues?.bandwidthMontly || 0)}
													</span>
												</td>
												<td className="px-6 py-5 text-center">
													<span className="text-sm font-mono font-medium text-some-less">
														{totalValues?.deploys}
													</span>
												</td>
												<td className="px-6 py-5 text-right">
													<span className="text-sm font-mono font-medium text-some-less">
														{formatDuration(totalValues?.total_build || 0)}
													</span>
												</td>
											</tr>
										)}
									</tbody>
								</table>
								{usagesIsError ? (
									<p className="text-red-400 px-4 mt-4">
										Error On Loading usages Data
										<br />
										{(usagesError as any).data.message}
									</p>
								) : ""}
								{projectsIsError ? (
									<p className="text-red-400 px-4 mt-4">
										Error On Loading Projects
										<br />
										{(projectsError as any).data.message}
									</p>
								) : ""}
							</div>
						</section>
						<section id="no-of-builds" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-background bg-white">
							<div className="pt-8 px-4 mb-6">
								<h2 className="text-2xl font-semibold tracking-tight text-primary ">Builds by Day</h2>
							</div>
							<Suspense fallback={<LoadingSpinner3 isLoading />}>
								<ChartDailyDeploys deploys={deploys || []} todaysDeploys={userDetailed?.deploymentsToday || 0} />
							</Suspense>
						</section>
					</main>
				</div>
			</div>
		</div>
	);
};
export default UsagePage