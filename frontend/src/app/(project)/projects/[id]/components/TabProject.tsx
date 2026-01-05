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
import { getStatusColor } from "@/lib/moreUtils/combined"

interface TabProjectProps {
	project: Project
	deploymentCtx: {
		deployment?: Deployment
		tempDeployment?: Deployment
		lastDeployment?: Deployment
		onCreateDeployment: () => void
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
	const { lastDeployment, deployment, tempDeployment, onCreateDeployment } = deploymentCtx
	const { setShowBuild, showBuild } = build
	const isProjectProgress = project.status === ProjectStatus.BUILDING || project.status === ProjectStatus.QUEUED


	return (
		<>
			<div className="dark:bg-neutral-950 border bg-neutral-50 w-full rounded-md mb-6 mt-4 p-4">
				{(project.deployments && project.deployments.length === 0 && !lastDeployment) && (
					<NoDeployment
						buttonAction={onCreateDeployment}
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
					runningDeploymentStatus={tempDeployment?.status}
					reDeploy={reDeploy}
					setShowBuild={setShowBuild}
					setTabs={setTabs}
				/>

				<div className="border dark:border-neutral-700 mt-2 border-neutral-300 rounded-md ">
					<button
						className="p-4 w-full"
						onClick={() => setShowBuild(!showBuild)}
					>
						<span className="flex flex-row-reverse gap-2 items-center justify-end text-primary">
							{isProjectProgress || tempDeployment && <>
								<AnimationBuild />
								<div className="ml-4 flex items-center gap-2">
									<StatusIcon status={deployment?.status || project.status} />
									<p className={`text-sm font-bold rounded-xs px-1 border ${getStatusColor(deployment?.status || project.status)}`}>{deployment?.status || project.status}</p>
								</div>
							</>
							}
							<span className="text-xs mt-2">
								{`( ${deployment?._id ? "Current Deployment" : lastDeployment?._id ? "Last Deployment" : ""}  )`}
							</span>
							Build Logs
							<MdKeyboardArrowRight
								className="size-6 transition-all duration-200"
								style={{
									transform: `rotateZ(${showBuild ? "90deg" : "0deg"})`,
								}}
							/>
						</span>
					</button>

					<AnimatePresence mode="sync">
						{showBuild && (
							<motion.div
								initial={{ opacity: 0, y: 20, height: 0 }}
								animate={{ opacity: 1, y: 0, height: "auto", }}
								exit={{ opacity: 0, y: -40, height: 0 }}
								transition={{ duration: 0.28, ease: "easeInOut" }}
								className="dark:bg-stone-900 bg-stone-100 h-auto"
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
				<div className="border px-3 py-2 rounded-md mt-9">
					<h3 className="mb-3 ml-2 mt-2 text-xl">Stats</h3>
					<Suspense fallback={
						<LoadingSpinner2 isLoading />
					}>
						<ProjectSimpleStats project={project} />
					</Suspense>
				</div>
			)}
		</>
	)
}
export default TabProject