'use client'

import { useEffect, useState } from "react"

import { projectApis, useGetProjectFullQuery } from "@/store/services/projectsApi"
import { useCreateDeploymentMutation, useGetDeploymentByIdQuery } from "@/store/services/deploymentApi"

import ErrorComponent from "../../../../components/ErrorComponent"
import { ProjectContent } from "./components/Content"
import { useDeploymentSSE } from "@/hooks/useUpdatesSse"
import { useGetDeploymentLogsQuery } from "@/store/services/logsApi"
import { addLogs, clearLogs } from "@/store/slices/logSlice"
import { ProjectStatus } from "@/types/Project"
import { useAppDispatch } from "@/store/store"
import { toast } from "sonner"
import { LoadingSpinner2 } from "@/components/LoadingSpinner"
import { isStatusProgress } from "@/lib/moreUtils/combined"
import { showToast } from "@/components/Toasts"
import { IoIosCloud, IoIosCube } from "react-icons/io"

interface ProjectPageContainerProps {
	projectId: string
	tab: string | undefined
}

export function ProjectPageContainer({ projectId, tab }: ProjectPageContainerProps) {
	const dispatch = useAppDispatch();

	const {
		data: project,
		isLoading,
		isError,
		error,
		refetch,
	} = useGetProjectFullQuery({ id: projectId, params: { include: "user" } })

	const [createDeployment, { isLoading: createDeploymentLoading }] = useCreateDeploymentMutation()
	const [showBuild, setShowBuild] = useState(false)
	const handleCreateDeployment = async () => {
		const t = showToast.message("Deployment", "New Deployment Requested", <IoIosCloud className="w-4 h-4" />)
		try {
			await createDeployment(projectId).unwrap()
			toast.dismiss(t)
			showToast.success("Deployment", "New Deployment Started")
			setShowBuild(true)
			setSseActive(true)
			await refetch()
			return true
		} catch (error: any) {
			setSseActive(false)
			if (error.status === 503 || error.data.status === 503) {
				showToast.error("Deployment", error.data.message + "; Please try again later", <IoIosCloud className="w-4 h-4" />)
				return false
			}
			toast.dismiss(t)
			showToast.error("Deployment ", "Error in creating new Deployment; \n" + error.data.message, <IoIosCloud className="w-4 h-4" />)
			return false
		}
	}
	const { data: tempDeployment } = useGetDeploymentByIdQuery(
		{
			id: project?.tempDeployment || "",
			params: {},
		},
		{
			skip: !project?.tempDeployment
		}
	)
	const { data: lastDeployment } = useGetDeploymentByIdQuery(
		{
			id: project?.lastDeployment || "",
			params: {},
		},
		{
			skip: !project?.lastDeployment || !!project.currentDeployment
		}
	)
	const { data: deployment } = useGetDeploymentByIdQuery(
		{
			id: project?.currentDeployment || "",
			params: {},
		},
		{
			skip: !project?.currentDeployment
		}
	)
	const { data: initialLogs, refetch: refetchLogs } = useGetDeploymentLogsQuery(
		{ deploymentId: deployment?._id ?? lastDeployment?._id ?? "" },
		{ skip: !showBuild || (!deployment?._id && !lastDeployment?._id) }
	)

	const [sseActive, setSseActive] = useState(false)
	useEffect(() => {
		if (initialLogs?.length) {
			dispatch(addLogs(initialLogs))
		}
		return () => { dispatch(clearLogs()) }
	}, [initialLogs, dispatch])

	useEffect(() => {
		setSseActive(
			Boolean((project?.tempDeployment && tempDeployment)
			)
		)
	}, [project?.tempDeployment, tempDeployment])


	useDeploymentSSE(project, refetch, sseActive, setSseActive, tempDeployment)

	const reDeploy = async () => {
		if (!project || (!deployment && !lastDeployment)) return
		if (isStatusProgress(project.status) || isStatusProgress(deployment?.status) || (project.tempDeployment && tempDeployment)) {
			showToast.error("Project error", `Cannot deploy when the project is in ${ProjectStatus.QUEUED}/${ProjectStatus.BUILDING} state`, <IoIosCube className="size-5" />)
			return
		}
		const goodResponse = await handleCreateDeployment()
		if (!goodResponse) {
			return
		}
		dispatch(
			projectApis.util.updateQueryData(
				"getProjectById",
				{ id: project._id, params: { include: "user" } },
				(draft) => {
					const newData = {
						status: ProjectStatus.QUEUED,
					}
					Object.assign(draft, newData)
				}
			)
		)
	}




	if (isLoading) return (
		<div className="h-screen flex items-center justify-center gap-2">
			<LoadingSpinner2 isLoading={true} />
		</div>
	)
	if (isError) return <ErrorComponent error={error} id={projectId} field="Project" />
	if (!project) {
		return (
			<ErrorComponent error={{ message: "project not found" }} id={projectId} field="Project" />
		)
	}



	return (
		<ProjectContent
			project={project}
			deployment={deployment}
			tempDeployment={tempDeployment}
			lastDeployment={lastDeployment}
			tabFromUrl={tab}
			refetch={refetch}
			reDeploy={reDeploy}
			showBuild={showBuild}
			setShowBuild={setShowBuild}
			newDeployment={{
				onCreateDeployment: handleCreateDeployment,
				createDeploymentLoading: createDeploymentLoading
			}}
			refetchLogs={refetchLogs}
		/>
	)
}
