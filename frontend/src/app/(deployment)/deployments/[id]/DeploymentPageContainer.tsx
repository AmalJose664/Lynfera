"use client";



import FilesComponent from "@/components/FilesComponent";
import { Logs } from "@/components/LogsComponent";
import ErrorComponent from "@/components/ErrorComponent";
import StatusIcon from "@/components/ui/StatusIcon";
import BackButton from "@/components/BackButton";
import {
	formatDuration,
	getGithubBranchUrl,
	getGithubCommitUrl,
	getStatusColor,
} from "@/lib/moreUtils/combined";
import { useGetDeploymentByIdQuery } from "@/store/services/deploymentApi";
import { useGetDeploymentLogsQuery } from "@/store/services/logsApi";
import { Project, ProjectStatus } from "@/types/Project";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
	FiGitCommit,
	FiClock,
} from "react-icons/fi";
import { IoMdGitBranch } from "react-icons/io";
import { FiAlertCircle } from "react-icons/fi";
import { MdKeyboardArrowRight, MdTimer } from "react-icons/md";
import { IoIosCube, IoMdGlobe } from "react-icons/io";
import { LuExternalLink } from "react-icons/lu";
import RightFadeComponent from "@/components/RightFadeComponent";
import { projectApis, useGetProjectByIdQuery } from "@/store/services/projectsApi";
import { useSelector } from "react-redux";
import { LoadingSpinner2 } from "@/components/LoadingSpinner";

const DeploymentPageContainer = ({ deploymentId }: { deploymentId: string }) => {

	const {
		data: deployment,
		isLoading,
		error,
		isError,
	} = useGetDeploymentByIdQuery({
		id: deploymentId,
		params: { include: "project" },
	});
	const project = deployment?.project as Project;
	const [showLogs, setShowLogs] = useState(false);
	const { data: logs, refetch, } = useGetDeploymentLogsQuery(
		{ deploymentId: deployment?._id ?? "" },
		{ skip: !showLogs || !deployment?._id }
	);

	if (error || isError) {
		return (
			<ErrorComponent error={error} id={deploymentId} field="Deployment" />
		);
	}
	const { data: cachedProject } = useSelector(projectApis.endpoints.getProjectById.select(
		{ id: project?._id || "", params: { include: "user" } }
	))
	if (!deployment && !isLoading) {
		return (
			<ErrorComponent
				error={{ message: "Deployment not found" }}
				id={deploymentId}
				field="Deployment"
			/>
		);
	}

	const isFailed =
		deployment?.status === ProjectStatus.CANCELED ||
		deployment?.status === ProjectStatus.FAILED;

	return (
		<div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100">
			{/* Sticky Header */}
			<div className="sticky top-0 z-20 border-b bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-neutral-200 dark:border-neutral-800">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2">
					<BackButton />
					{!isLoading && deployment && (<>
						<div className="text-xs font-mono text-neutral-500">
							deployments
						</div>
						<div className="text-xs font-mono text-neutral-500">
							/
						</div>
						<div className="text-xs font-mono text-neutral-500">
							{deployment._id}
						</div>
					</>
					)}
				</div>
			</div>

			<div className="max-w-[1350px] mx-auto px-4 sm:px-6 py-8 border mt-4 rounded-md mb-10 dark:bg-zinc-950 bg-zinc-100">
				{isLoading ? (
					<LoadingSpinner2 isLoading={isLoading} loadingText="Retrieving deployment details..." />
				) : (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
						className="space-y-6 "
					>
						{/* Header Section */}
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div>
								<h1 className="text-2xl font-bold flex items-center gap-2">
									<IoIosCube className="" />
									{project.name}
									<span className="text-neutral-400 font-normal mx-2">/</span>
									<span className="text-lg font-normal text-neutral-500">
										Deployment
									</span>
									<span className="text-neutral-400 font-normal mx-2">|</span>
									<span className="text-sm font-normal text-neutral-500">
										{deployment.identifierSlug}
									</span>
									{(cachedProject
										&& cachedProject.currentDeployment === deployment._id)
										&& <span className="py-1 px-2 border border-blue-500 rounded-full text-xs text-blue-400">
											current
										</span>
									}
								</h1>
							</div>

							<div className="flex items-center gap-3">
								<div
									className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${getStatusColor(
										deployment.status as ProjectStatus
									)} bg-opacity-10 border-opacity-20`}
								>
									<StatusIcon status={deployment.status} />
									<span className="text-sm font-medium capitalize">
										{deployment.status.toLowerCase()}
									</span>
								</div>
								{!isFailed && deployment.status === ProjectStatus.READY && (
									<Link
										href={`${window.location.protocol}//${project.subdomain}.${process.env.NEXT_PUBLIC_PROXY_SERVER}`}
										target="_blank"
										className="flex items-center gap-2 px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
									>
										Visit <LuExternalLink />
									</Link>
								)}
							</div>
						</div>

						{isFailed && (
							<div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-lg p-4 flex items-start gap-3">
								<FiAlertCircle className="text-red-500 mt-0.5 size-5" />
								<div>
									<h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
										Deployment Failed
									</h3>
									<p className="text-sm text-red-600 dark:text-red-300 mt-1">
										{deployment.errorMessage ||
											"An unknown error occurred during the build process."}
									</p>
								</div>
							</div>
						)}

						<div>
							<div className="flex flex-col md:flex-row flex-1 items-center gap-3 justify-around">
								<RightFadeComponent className="space-y-6 flex-2 w-full">
									<div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
										<div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
											<h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
												Deployment Details
											</h3>
										</div>
										<div className="divide-y divide-neutral-100 dark:divide-neutral-800">

											{!isFailed && (
												<div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 gap-4 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
													<div className="text-sm text-neutral-500 font-medium flex items-center gap-2">
														<IoMdGlobe className="size-4" /> Domains
													</div>
													<div className="sm:col-span-2">
														<Link
															href={`${window.location.protocol}//${project.subdomain}.${process.env.NEXT_PUBLIC_PROXY_SERVER}`}
															target="_blank"
															className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block font-mono"
														>
															{project.subdomain}.
															{process.env.NEXT_PUBLIC_PROXY_SERVER}
														</Link>
													</div>
												</div>
											)}

											<div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 gap-4 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
												<div className="text-sm text-neutral-500 font-medium flex items-center gap-2">
													<IoMdGitBranch className="size-4" /> Branch
												</div>
												<div className="sm:col-span-2">
													<Link
														href={getGithubBranchUrl(
															project.repoURL,
															project.branch
														)}
														target="_blank"
														className="inline-flex items-center px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-mono hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
													>
														<IoMdGitBranch className="mr-1 size-3" />
														{project.branch}
													</Link>
												</div>
											</div>

											<div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 gap-4 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
												<div className="text-sm text-neutral-500 font-medium flex items-center gap-2">
													<FiGitCommit className="size-4" /> Commit
												</div>
												<div className="sm:col-span-2 flex flex-col gap-1">
													<span className="text-sm text-neutral-900 dark:text-neutral-200 truncate">
														{deployment.commit.msg}
													</span>
													<Link
														href={getGithubCommitUrl("", deployment.commit.id)}
														target="_blank"
														className="text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300 w-fit"
													>
														{deployment.commit.id.substring(0, 7)}
													</Link>
												</div>
											</div>
										</div>
									</div>
								</RightFadeComponent>
								<RightFadeComponent delay={.1} className="bg-white dark:bg-neutral-900 w-full rounded-md border border-neutral-200 dark:border-neutral-800 shadow-sm p-6 flex-1">
									<h3 className="font-semibold text-sm text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
										<FiClock /> Performance Metrics
									</h3>
									<div className="space-y-6 relative">
										<div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-neutral-100 dark:bg-neutral-800"></div>

										<div className="relative pl-8">
											<div className="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 bg-blue-500 shadow-sm z-10"></div>
											<p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">
												Installation
											</p>
											<p className="text-lg font-mono font-medium text-neutral-900 dark:text-white">
												{formatDuration(deployment.performance.installTime)}
											</p>
										</div>

										<div className="relative pl-8">
											<div className="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 bg-purple-500 shadow-sm z-10"></div>
											<p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">
												Build
											</p>
											<p className="text-lg font-mono font-medium text-neutral-900 dark:text-white">
												{formatDuration(deployment.performance.buildTime)}
											</p>
										</div>

										<div className="relative pl-8 pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-4">
											<p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">
												Total Duration
											</p>
											<p className="text-xl font-mono font-bold text-neutral-900 dark:text-white">
												{formatDuration(deployment.performance.totalDuration)}
											</p>
										</div>
									</div>
								</RightFadeComponent>
							</div>
							<div className="mt-10 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
								<button
									onClick={() => setShowLogs(!showLogs)}
									className="w-full flex items-center justify-between px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors rounded-t-lg"
								>
									<div className="flex items-center gap-2">
										<span className="relative flex h-2 w-2">
											{deployment.status === ProjectStatus.BUILDING && (
												<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
											)}
											<span
												className={`relative inline-flex rounded-full h-2 w-2 ${deployment.status === ProjectStatus.BUILDING
													? "bg-yellow-500"
													: "bg-neutral-400"
													}`}
											></span>
										</span>
										<h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
											Build Logs
										</h3>
									</div>
									<MdKeyboardArrowRight
										className={`size-5 text-neutral-500 transition-transform duration-200 ${showLogs ? "rotate-90" : ""
											}`}
									/>
								</button>
								<AnimatePresence>
									{showLogs && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											className="overflow-hidden border-t border-neutral-200 dark:border-neutral-800"
										>
											<div className="p-1">
												<Logs
													deploymentId={deployment?._id || ""}
													deploymentSpecificLogs={logs}
													refetch={refetch}
												/>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</div>
						<RightFadeComponent className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
							<div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
								<h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
									Output Files
								</h3>
							</div>
							<div className="flex-1 overflow-auto p-2">
								<FilesComponent
									projectId={project._id}
									deploymentId={deployment._id}
								>
									<h4 id="files" className="font-semibold text-primary">Build Output Files</h4>
								</FilesComponent>
							</div>
						</RightFadeComponent>
					</motion.div>

				)}
			</div>
		</div>
	);
};

export default DeploymentPageContainer;