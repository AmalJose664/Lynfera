import { AnimatePresence, motion } from "motion/react"
import { MdKeyboardArrowRight } from "react-icons/md"
import ProjectOverview from "./ProjectOverview"
import ProjectDeploymentBox from "./ProjectDeploymentBox"
import ProjectSimpleStats from "./ProjectSimpleStats"
import NoDeployment from "./NoDeployment"
import { Logs } from "@/components/LogsComponent"
import { Project, ProjectStatus } from "@/types/Project"
import { Deployment } from "@/types/Deployment"
import { IoRocketOutline } from "react-icons/io5"
import { Suspense } from "react"
import { LoadingSpinner2 } from "@/components/LoadingSpinner"
import StatusIcon, { AnimationBuild } from "@/components/ui/StatusIcon"
import { getStatusColor, isStatusProgress } from "@/lib/moreUtils/combined"

interface TabProjectProps {
	project: Project
	deploymentCtx: {
		deployment?: Deployment
		tempDeployment?: Deployment
		lastDeployment?: Deployment
		newDeployment: {
			onCreateDeployment: () => void;
			createDeploymentLoading: boolean
		}
	}
	build: {
		showBuild: boolean
		setShowBuild: (v: boolean) => void
	}
	setTabs: (state: string) => void;
	reDeploy: () => void;
	refetchLogs: () => void;

}


const TabProject = ({ project, deploymentCtx, build, setTabs, reDeploy, refetchLogs }: TabProjectProps) => {
	const { lastDeployment, deployment, tempDeployment, newDeployment } = deploymentCtx
	const { setShowBuild, showBuild } = build
	const isProjectProgress = isStatusProgress(project.status)


	return (
		<>
			<div className="dark:bg-neutral-950 border bg-neutral-50 w-full rounded-md mb-6 mt-4 p-3 md:p-4">
				{(project.deployments && project.deployments.length === 0 && !lastDeployment) && (
					<NoDeployment
						buttonAction={newDeployment.onCreateDeployment}
						buttonState={newDeployment.createDeploymentLoading}
						titleText="No Deployments Yet"
						descriptionText="You haven&apos;t created any project deployment yet. Run your project by creating your new Deployment."
						buttonText="Create Deployment"
						buttonIcon={<IoRocketOutline />}
						learnMoreUrl="#"
					/>
				)}
				<ProjectOverview
					project={project}
					deployment={deployment || lastDeployment}
					runningDeployment={tempDeployment}
					reDeploy={reDeploy}
					setShowBuild={setShowBuild}
					setTabs={setTabs}
				/>

				<div className="border dark:border-neutral-700 mt-6 border-neutral-300 rounded-md">
					<button
						className="p-3 md:p-4 w-full"
						onClick={() => setShowBuild(!showBuild)}
					>
						<span className="flex flex-col sm:flex-row gap-2 sm:items-center justify-start text-primary w-full">
							<div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
								<div className="flex items-center gap-1">
									Build Logs
									<MdKeyboardArrowRight
										className="size-6 transition-all duration-200"
										style={{
											transform: `rotateZ(${showBuild ? "90deg" : "0deg"})`,
										}}
									/>
								</div>
							</div>
							<span className="text-xs text-muted-foreground self-start sm:self-center mr-auto sm:mr-2">
								{`( ${!project.tempDeployment && deployment?._id ? "Current" : (project.tempDeployment && tempDeployment?._id) ? "Temp" : "Last"} )`}
							</span>
							{(isProjectProgress || isStatusProgress(tempDeployment?.status)) && (
								<div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
									<div className="ml-4 flex items-center gap-2">
										<StatusIcon status={tempDeployment?.status || project.status} />
										<p className={`text-sm font-bold rounded-xs px-1 border ${getStatusColor(tempDeployment?.status || project.status)}`}>
											{tempDeployment?.status || project.status}
										</p>
									</div>
									<AnimationBuild />
								</div>
							)}

						</span>
					</button>

					<AnimatePresence mode="sync">
						{showBuild && (
							<motion.div
								initial={{ opacity: 0, y: 20, height: 0 }}
								animate={{ opacity: 1, y: 0, height: "auto", }}
								exit={{ opacity: 0, y: -40, height: 0 }}
								transition={{ duration: 0.28, ease: "easeInOut" }}
								className="dark:bg-stone-900 bg-stone-100 h-auto overflow-hidden"
							>
								<Logs deploymentId={deployment?._id || ""} refetch={refetchLogs} />
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>

			{project.tempDeployment && project.deployments && project.deployments?.length > 0 && tempDeployment && (
				<ProjectDeploymentBox
					deployment={tempDeployment}
					projectBranch={project.branch}
					repoURL={project.repoURL}
					showLogs={() => setShowBuild(true)}
					type={"Progress"}
				/>
			)}

			{project.deployments && project.deployments?.length > 0 && deployment && (
				<ProjectDeploymentBox
					deployment={deployment}
					projectBranch={project.branch}
					repoURL={project.repoURL}
					showLogs={() => setShowBuild(true)}
					type={"Current"}
				/>
			)}

			{project.lastDeployment && project.deployments && project.deployments?.length > 0 && lastDeployment && !deployment && (
				<ProjectDeploymentBox
					deployment={lastDeployment}
					projectBranch={project.branch}
					repoURL={project.repoURL}
					showLogs={() => setShowBuild(true)}
					type={"Last"}
				/>
			)}

			{project.deployments && project.deployments?.length > 0 && (
				<div className="border px-3 py-2 rounded-md mt-9 overflow-hidden mb-14">
					<h3 className="mb-3 ml-2 mt-2 text-xl">Stats</h3>
					<Suspense fallback={
						<LoadingSpinner2 isLoading />
					}>
						<div className="overflow-x-hidden">
							<ProjectSimpleStats project={project} />
						</div>
					</Suspense>
				</div>
			)}
		</>
	)
}
export default TabProject