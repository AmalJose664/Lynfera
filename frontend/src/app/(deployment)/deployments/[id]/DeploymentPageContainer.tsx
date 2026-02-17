"use client";



import FilesComponent from "@/components/FilesComponent";
import { Logs } from "@/components/LogsComponent";
import ErrorComponent from "@/components/ErrorComponent";
import StatusIcon from "@/components/ui/StatusIcon";
import BackButton from "@/components/BackButton";
import {
	formatDate,
	formatDuration,
	generateRepoUrls,
	getGithubBranchUrl,
	getGithubCommitUrl,
	getPercentage,
	getStatusColor,
	isStatusFailure,
	isStatusProgress,
} from "@/lib/moreUtils/combined";
import { useGetDeploymentByIdQuery } from "@/store/services/deploymentApi";
import { useGetDeploymentLogsQuery } from "@/store/services/logsApi";
import { Project, ProjectStatus } from "@/types/Project";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiGitCommit, } from "react-icons/fi";
import { IoMdGitBranch } from "react-icons/io";
import { FiAlertCircle } from "react-icons/fi";
import { MdKeyboardArrowRight, } from "react-icons/md";
import { IoIosCube, IoMdGlobe } from "react-icons/io";
import { LuExternalLink } from "react-icons/lu";
import RightFadeComponent from "@/components/RightFadeComponent";
import { LoadingSpinner2 } from "@/components/LoadingSpinner";
import { RiPencilFill } from "react-icons/ri";
import { PiIdentificationCardLight } from "react-icons/pi";
import { Deployment } from "@/types/Deployment";

import { CiMicrochip } from "react-icons/ci";
import OptionsComponent from "@/components/OptionsComponent";
import { IoClipboardOutline, IoTrashOutline } from "react-icons/io5";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { BsArrowUpCircle } from "react-icons/bs";
import ChangeDeploymentModal from "@/components/modals/ChangeDeployment";
import DeleteDeploymentModal from "@/components/modals/DeleteDeployment";


const DeploymentPageContainer = ({ deploymentId }: { deploymentId: string }) => {
	const router = useRouter()
	const {
		data: deployment,
		isLoading,
		error,
		isError,
		refetch: refetchDeply
	} = useGetDeploymentByIdQuery({
		id: deploymentId,
		params: { include: "project" },
	});
	const params = useSearchParams()

	const toggleLogs = params.get("showlogs") === "true"
	const project = deployment?.project as Project;
	const [showLogs, setShowLogs] = useState(toggleLogs || false);
	const { data: logs, refetch, } = useGetDeploymentLogsQuery(
		{ deploymentId: deployment?._id ?? "" },
		{ skip: !showLogs || !deployment?._id }
	);


	const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null)
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const isFailed = isStatusFailure(deployment?.status);
	const logsRef = useRef<null | HTMLDivElement>(null)
	useEffect(() => {
		if (toggleLogs && logsRef.current) {
			const timer = setTimeout(() => {
				logsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
			}, 500)

			return () => clearTimeout(timer)
		}
	}, [toggleLogs])
	if (!deployment && !isLoading) {
		return (
			<ErrorComponent
				error={{ message: "Deployment not found" }}
				id={deploymentId}
				field="Deployment"
			/>
		);
	}
	if (error || isError) {
		return (
			<ErrorComponent error={error} id={deploymentId} field="Deployment" />
		);
	}
	return (
		<div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100">
			{selectedDeploymentId && <ChangeDeploymentModal refetchDeply={refetchDeply} setSelectedDeploymentId={setSelectedDeploymentId} selectedDeploymentId={selectedDeploymentId} projectId={(deployment?.project as Project)._id} />}
			{showDeleteModal && <DeleteDeploymentModal deploymentId={deployment?._id || ""} setShowDeleteDeplymntModal={setShowDeleteModal} showDeleteDeplymntModal={showDeleteModal} projectId={project._id} />}
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
									{((deployment.project as Project).currentDeployment === deployment._id)
										&& <span className="py-1 uppercase px-2 border border-blue-500 rounded-full text-[11px] text-blue-400 tracking-wider">
											current deployment
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
										Visit Project<LuExternalLink />
									</Link>
								)}
								{!isFailed && deployment.status === ProjectStatus.READY && (
									<Link
										href={`${window.location.protocol}//${project.subdomain}--${deployment.publicId}.${process.env.NEXT_PUBLIC_PROXY_SERVER}`}
										target="_blank"
										className="flex items-center gap-2 px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
									>
										Visit This Deployment<LuExternalLink />
									</Link>
								)}
								<OptionsComponent parentClassName="" options={[
									{
										title: "Promote Deployment",
										actionFn: () => setSelectedDeploymentId(deployment._id),
										className: "",
										isDisabled: deployment.status != ProjectStatus.READY
											|| deployment._id === (deployment.project as Project).currentDeployment,
										Svg: BsArrowUpCircle
									},
									{
										title: "Show Project",
										actionFn: () => router.push("/projects/" + (deployment.project as Project)._id),
										className: "",
										Svg: IoIosCube
									},
									{
										title: "Copy Deployment ID",
										actionFn: () => navigator.clipboard.writeText(deployment._id),
										className: "",
										Svg: IoClipboardOutline
									},
									{
										title: "Copy Public ID",
										actionFn: () => navigator.clipboard.writeText(deployment.publicId),
										className: "",
										Svg: IoClipboardOutline
									},
									...(isStatusFailure(deployment.status) && deployment._id !== project.currentDeployment ? [{
										title: "Delete Failed Deployment",
										actionFn: () => setShowDeleteModal(true),
										isDisabled: !isStatusFailure(deployment.status),
										className: "text-red-400",
										Svg: IoTrashOutline
									}] : []),

								]} />
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
								<RightFadeComponent className="space-y-6 flex-1 w-full">
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
														href={generateRepoUrls(project.repoURL, { branch: project.branch }).branch || project.repoURL}
														target="_blank"
														className="inline-flex items-center px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs font-mono hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
													>
														<IoMdGitBranch className="mr-1 size-3" />
														<span className="line-clamp-1 text-primary">
															{project.branch}
														</span>
													</Link>
												</div>
											</div>

											<div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 gap-4 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
												<div className="text-sm text-neutral-500 font-medium flex items-center gap-2">
													<FiGitCommit className="size-4" /> Commit
												</div>
												<Link target="_blank" href={generateRepoUrls(project.repoURL, { commitSha: deployment.commit.id }).commit || project.repoURL} className="sm:col-span-2 flex flex-col gap-1 w-fit">
													<span className="text-sm text-neutral-900 dark:text-neutral-200 line-clamp-1">
														{deployment.commit.msg}
													</span>
													<span className="text-xs">
														{deployment.commit.id.substring(0, 7)}
													</span>

												</Link>
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 gap-4 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
												<div className="text-sm text-neutral-500 font-medium flex items-center gap-2">
													<CiMicrochip className="size-4" /> Environment
												</div>
												<div className="sm:col-span-2 flex flex-col gap-1">
													<span className="text-xs border bg-emerald-500/10 w-fit rounded-md px-2 text-emerald-400 truncate">
														{deployment.environment}
													</span>
												</div>
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 gap-4 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
												<div className="text-sm text-neutral-500 font-medium flex items-center gap-2">
													<RiPencilFill className="size-4" /> Created
												</div>
												<div className="sm:col-span-2 flex flex-col gap-1">
													<span className="text-sm text-neutral-900 dark:text-neutral-200 truncate">
														{formatDate(deployment.createdAt)}
													</span>
												</div>
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 gap-4 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
												<div className="text-sm text-neutral-500 font-medium flex items-center gap-2">
													<PiIdentificationCardLight className="size-4" /> Identifier Slug
												</div>
												<div className="sm:col-span-2 flex flex-col gap-1">
													<span className="text-xs text-less truncate">
														{deployment.identifierSlug}
													</span>
												</div>
											</div>
										</div>
									</div>
								</RightFadeComponent>
								<PerformanceMetrics performance={deployment.performance} />
							</div>
							<div className="mt-10 min-h-1 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm" ref={logsRef} id="logs">
								<button
									onClick={() => setShowLogs(!showLogs)}
									className="w-full flex items-center justify-between px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors rounded-t-lg"
								>
									<div className="flex items-center gap-2">
										<span className="relative flex h-2 w-2">
											{isStatusProgress(deployment.status) && (
												<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
											)}
											<span
												className={`relative inline-flex rounded-full h-2 w-2 ${isStatusProgress(deployment.status)
													? "bg-yellow-500"
													: "bg-neutral-400"
													}`}
											></span>
										</span>
										<h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
											Build Logs
										</h3>
										<MdKeyboardArrowRight
											className={`size-5 text-some-less transition-transform duration-200 ${showLogs ? "rotate-90" : ""
												}`}
										/>
										{isStatusProgress(deployment.status) && (
											<>
												<StatusIcon status={deployment?.status} />
												<p className={`text-sm font-bold rounded-xs px-1 border ${getStatusColor(deployment?.status)}`}>
													{deployment?.status}
												</p>
											</>

										)}
									</div>
								</button>
								<AnimatePresence>
									{showLogs && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											className="overflow-hidden border-t border-neutral-200 relative dark:border-neutral-800"
										>
											<div className="p-1">
												<Logs
													deploymentId={deployment?._id || ""}
													deploymentSpecificLogs={logs}
													scrollToBottom={toggleLogs}
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
									projectRepo={project.repoURL}
									projectId={project._id}
									commit={deployment.commit}
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


const PerformanceMetrics = ({ performance }: { performance: Deployment['performance'] }) => {
	const { uploadTime, installTime, buildTime, totalDuration } = performance
	const durationsArray = [
		{
			label: "Install",
			value: installTime,
			color: "from-emerald-500/20 to-emerald-500/5",
			accent: "bg-emerald-500"
		},
		{
			label: "Build",
			value: buildTime,
			color: "from-amber-500/20 to-amber-500/5",
			accent: "bg-amber-500"
		},
		{
			label: "Upload",
			value: uploadTime,
			color: "from-sky-500/20 to-sky-500/5",
			accent: "bg-sky-500"
		},
		{
			label: "Bg tasks (queueing, build start)",
			value: totalDuration - (uploadTime + buildTime + installTime),
			color: "from-neutral-500/10 to-neutral-800",
			accent: "bg-neutral-400"
		},
	]
	// ai code
	return (

		<RightFadeComponent delay={0.1} className="bg-white dark:bg-neutral-900 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex-1">

			<div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
				<span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
					Build Performance
				</span>
				<span className="text-[10px] font-mono font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded">
					DURATIONS
				</span>
			</div>

			<div className="p-2 space-y-1">
				{durationsArray.map((item, idx) => (
					<div key={idx} className="relative group px-4 py-3 overflow-hidden rounded-md border border-transparent hover:border-neutral-100 dark:hover:border-neutral-800 transition-all duration-300">
						<RightFadeComponent delay={.3} distance={100} left
							style={{ width: getPercentage(item.value, performance.totalDuration) + "%" }}
							className={`absolute inset-y-0 left-0 bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out`}
						>
							<RightFadeComponent delay={.4} left className={`absolute right-0 top-1 bottom-1 w-[2px] ${item.accent} shadow-[0_0_10px_${item.accent.replace('bg-', '')}] opacity-50`}>{""}</RightFadeComponent>
						</RightFadeComponent>

						<div className="relative z-10 flex justify-between items-center">
							<div className="flex items-center gap-3">
								<div className="relative flex h-1 w-1">
									<div className={`absolute inline-flex h-full w-full rounded-full ${item.accent} opacity-20 animate-pulse`} />
									<div className={`relative inline-flex rounded-full h-1 w-1 ${item.accent}`} />
								</div>

								<span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
									{item.label}
								</span>
							</div>

							<div className="flex items-center gap-3">
								<span className="text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
									{getPercentage(item.value, totalDuration)}%
								</span>
								<span className="text-sm font-mono font-bold text-neutral-900 dark:text-white">
									{formatDuration(item.value)}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="mt-2 p-6 bg-neutral-50 dark:bg-white/[0.02] border-t border-neutral-100 dark:border-neutral-800">
				<div className="flex justify-between gap-5 items-end">
					<div className="space-y-1">
						<p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Total Execution</p>
						<p className="text-xl font-mono font-black text-neutral-900 dark:text-white leading-none tracking-tighter">
							{formatDuration(totalDuration)}
						</p>
					</div>
					<div className="my-auto flex-1 px-4 py-2">

						<div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
							{durationsArray.map((item, i) => {
								const width = getPercentage(item.value, totalDuration);
								return (
									<div
										key={i}
										style={{ width: `${width}%` }}
										className={`${item.accent} h-full transition-all duration-700 ease-out border-r border-white/20 dark:border-black/20 last:border-r-0`}
										title={`${item.label} duration ${item.value}ms`}
									/>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</RightFadeComponent>
	);
};
