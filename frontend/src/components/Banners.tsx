import { Deployment } from "@/types/Deployment"
import RightFadeComponent from "./RightFadeComponent"
import { FiAlertCircle } from "react-icons/fi"
import { IoClose, IoGitBranchOutline } from "react-icons/io5"
import { useEffect, useRef, useState } from "react"
import { LinkComponent } from "./docs/HelperComponents"
import { Project, ProjectStatus } from "@/types/Project"
import { getLatestCommit, isStatusProgress } from "@/lib/moreUtils/combined"
import { RootState, useAppDispatch, useAppSelector } from "@/store/store"
import { fetchCommit } from "@/store/slices/projectDataSlice"
import { FaArrowRight } from "react-icons/fa"
import { Button } from "./ui/button"

export const DeploymentDuarionWarning = ({ runningDeployment }: { runningDeployment?: Deployment }) => {
	const showWarning = (runningDeployment && new Date().getTime() - new Date(runningDeployment.createdAt || "").getTime() > 10 * (60 * 1000)) && (runningDeployment.status === ProjectStatus.QUEUED || runningDeployment.status === ProjectStatus.BUILDING);
	if (!showWarning) {
		return null
	}

	return (
		<RightFadeComponent className="border mb-5 rounded-lg dark:bg-neutral-900  bg-white overflow-hidden relative">
			<div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex items-start gap-3">
				<FiAlertCircle className="text-amber-500 mt-0.5 size-5" />
				<div>
					<h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
						Deployment is taking longer than expected
					</h3>
					<div className="space-y-1 mt-2">
						<p className="text-sm text-primary mb-2">
							We are currently waiting for an available runner to start your build. This may take a few minutes during high demand.
						</p>
						<p className="text-xs text-primary">
							Deployment ID: {runningDeployment?._id}
						</p>
						<p className="text-xs text-primary">
							Deployment Slug: {runningDeployment?.identifierSlug}
						</p>
					</div>
				</div>
			</div>
		</RightFadeComponent>
	)
}


export const DeploymentFailedWarning = ({ runningDeployment }: { runningDeployment?: Deployment }) => {
	const [lastFailed, setLastFailed] = useState<boolean>(false)
	const runningDeploymentStatus = runningDeployment?.status
	useEffect(() => {
		if (runningDeploymentStatus === ProjectStatus.FAILED || runningDeploymentStatus === ProjectStatus.CANCELED) {
			setLastFailed(true)
		}
	}, [runningDeploymentStatus])
	if (!lastFailed) {
		return null
	}
	return (
		<RightFadeComponent className="border mb-5 rounded-lg dark:bg-neutral-900  bg-white overflow-hidden relative">
			<div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-lg p-4 flex items-start gap-3">
				<FiAlertCircle className="text-red-500 mt-0.5 size-5" />
				<div>
					<h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
						Last Deployment Failed <LinkComponent href={"/deployments/" + runningDeployment?._id} className="ml-3">View</LinkComponent>
					</h3>
					<div className="space-y-1 mt-2">
						<p className="text-sm text-primary">
							Deployment ID: {runningDeployment?._id}
						</p>
						<p className="text-sm text-primary">
							Deployment Slug: {runningDeployment?.identifierSlug}
						</p>
					</div>
				</div>
			</div>
			<button className="absolute top-1 right-1" onClick={() => setLastFailed(false)}>
				<IoClose size={20} className="m-2" />
			</button>
		</RightFadeComponent>

	)
}

export const NewCommitFound = ({ project, currentCommit, newDeploymentDialog }: { project: Project, currentCommit?: Deployment['commit'], newDeploymentDialog: () => void }) => {
	const projectData = useAppSelector((state: RootState) => state.projectData[project._id])

	const dispatch = useAppDispatch()
	useEffect(() => {
		if (!projectData) {
			dispatch(fetchCommit({ project }))
		}
	}, [dispatch, project])

	const [showBanner, setShowBanner] = useState(false)




	useEffect(() => {
		const key = "commit-shown-" + projectData?.latestCommitId
		const alreadyShown = sessionStorage.getItem(key) === "true"

		const isNew = projectData?.latestCommitId !== currentCommit?.id

		setShowBanner(isNew && !alreadyShown)

	}, [projectData?.latestCommitId, currentCommit])




	if (!showBanner || !currentCommit || project.tempDeployment || project.isPrivateGhRepo || isStatusProgress(project.status)) {
		return null
	}
	if (!project._id) return null

	const closeAndSave = () => {
		sessionStorage.setItem("commit-shown-" + projectData.latestCommitId, "true")
		setShowBanner(false)
	}
	return (
		<RightFadeComponent className="border mb-5 rounded-lg dark:bg-neutral-900  bg-white overflow-hidden relative">
			<div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900 rounded-lg p-4 flex items-start gap-3">
				<IoGitBranchOutline className="text-emerald-500 mt-0.5 size-5" />
				<div>
					<h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
						New Commit available to deploy
					</h3>
					<div className="mt-2 flex flex-col items-center gap-4">
						<div className="flex items-center gap-4">
							<div className="border bg-emerald-200 dark:bg-emerald-300/10 px-2 py-1 rounded-md">
								<p className="text-sm text-primary">
									{currentCommit.id.slice(0, 6)}
								</p>
								<p className="text-sm text-primary truncate max-w-[150px] sm:max-w-xs">
									{currentCommit.msg}
								</p>
							</div>
							<span>
								<FaArrowRight />
							</span>
							<div className="border bg-emerald-200 dark:bg-emerald-300/10 px-2 py-1 rounded-md">
								<p className="text-sm text-primary">
									{projectData.latestCommitId?.slice(0, 6)}
								</p>
								<p className="text-sm text-primary truncate max-w-[150px] sm:max-w-xs">
									{projectData.latestCommitMsg}
								</p>
							</div>
						</div>
						<Button variant={"outline"} onClick={newDeploymentDialog}>Start Deploy</Button>
					</div>
				</div>
			</div>
			<button className="absolute top-1 right-1" onClick={() => closeAndSave()}>
				<IoClose size={20} className="m-2" />
			</button>
		</RightFadeComponent>

	)
}
