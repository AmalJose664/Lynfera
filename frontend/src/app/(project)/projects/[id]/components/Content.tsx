
'use client'

import { FiMoreHorizontal } from "react-icons/fi"
import { TiArrowLeft } from "react-icons/ti"
import ProjectTabs from "../../../../../components/project/ProjectTabs"
import { Project } from "@/types/Project"
import { Deployment } from "@/types/Deployment"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AllDeployments from "./TabAllDeployments"
import { useCallback, useEffect, useRef, useState } from "react"
import ProjectSettings from "./TabProjectSettings"
import ProjectAnalytics from "./TabProjectAnalytics"
import TabProject from "./TabProject"
import TabFiles from "./TabFiles"
import { IoIosCube } from "react-icons/io"
import BackButton from "@/components/BackButton"
import OptionsComponent from "@/components/OptionsComponent"
import { IoCloudUpload, IoTrashOutline } from "react-icons/io5"
import { GrStatusDisabled } from "react-icons/gr"
import NewDeploymentConfirmBox from "@/components/modals/NewDeploymentConfirmBox"
import { useRouter, useSearchParams } from "next/navigation"
import { LiaRedoAltSolid } from "react-icons/lia"


interface ProjectContentProps {
	project: Project
	deployment?: Deployment
	tempDeployment?: Deployment
	lastDeployment?: Deployment
	refetch: () => void
	showBuild: boolean
	setShowBuild: (state: boolean) => void;
	tabFromUrl?: string
	reDeploy: () => Promise<void>;
	newDeployment: {
		onCreateDeployment: () => void;
		createDeploymentLoading: boolean
	}
	refetchLogs: () => void
}

export function ProjectContent({
	project,
	deployment,
	tempDeployment,
	lastDeployment,
	refetch,
	tabFromUrl,
	showBuild,
	setShowBuild,
	reDeploy,
	newDeployment,
	refetchLogs
}: ProjectContentProps) {
	const [tab, setTabs] = useState(tabFromUrl || "overview")
	const [showConfirm, setShowConfirm] = useState(false)
	const scrollRef = useRef<HTMLDivElement>(null)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const scrollFn = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current)
		}
		setTabs("settings")
		timerRef.current = setTimeout(() => {
			scrollRef.current?.scrollIntoView({ behavior: "smooth" })
		}, 600)
	}, [])
	const router = useRouter()
	const searchParams = useSearchParams()
	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current)
			}
		}
	}, [])
	const onTabChange = (value: string) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set("tab", value)
		setTabs(value)
		router.push(`?${params.toString()}`, { scroll: false })
	}
	const optionsArray = [
		{
			title: "Create New Deployment",
			actionFn: () => setShowConfirm(true),
			className: "",
			Svg: IoCloudUpload
		},
		{
			title: "Refresh Data",
			actionFn: refetch,
			className: "",
			Svg: LiaRedoAltSolid
		},
		{
			title: "Manage Subdomain",
			actionFn: scrollFn,
			className: "",
		},
		{
			title: "Disable project",
			actionFn: scrollFn,
			className: "text-red-400 hover:text-red-500 ",
			Svg: GrStatusDisabled
		},
		{
			title: "Delete Project",
			actionFn: scrollFn,
			className: "text-red-400 hover:text-red-500 ",
			Svg: IoTrashOutline
		},
	]

	return (
		<div className="min-h-screen">
			<NewDeploymentConfirmBox
				project={project}
				showConfirm={showConfirm}
				setShowConfirm={setShowConfirm}
				handleClick={() => {
					setTabs("overview")
					reDeploy()
				}}
				setTabs={setTabs}
			/>
			<Tabs defaultValue="overview" value={tab} onValueChange={onTabChange} className="w-full">
				<header className="border-b dark:border-neutral-800 border-neutral-200">
					<div className="max-w-[1420px] mx-auto px-4 md:px-6 py-4">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full">
								<div className="flex items-center justify-between w-full md:w-auto">
									<div className="flex items-center gap-3 md:gap-6">
										<BackButton specificUrl="/projects" />
										<h1 className="text-lg md:text-xl flex gap-2 items-center font-semibold truncate">
											<span className="truncate max-w-[200px] md:max-w-none">{project.name}</span>
											<IoIosCube className="flex-shrink-0" />
										</h1>
									</div>
									<div className="md:hidden">
										<OptionsComponent parentClassName="" options={optionsArray} />
									</div>
								</div>

								<div className="w-full md:w-auto">
									<ProjectTabs setTab={setTabs} tab={tab} />
								</div>
							</div>

							<div className="hidden md:block">
								<OptionsComponent parentClassName="" options={optionsArray} />
							</div>
						</div>
					</div>
				</header>

				<main className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
					<TabsContent value="overview">
						<TabProject
							project={project}
							deploymentCtx={{
								deployment,
								tempDeployment,
								lastDeployment,
								newDeployment
							}}
							build={{ setShowBuild, showBuild }}
							reDeploy={reDeploy}
							setTabs={setTabs}
							refetchLogs={refetchLogs}
						/>
					</TabsContent>
					<TabsContent value="deployments">
						<AllDeployments projectId={project._id} subdomain={project.subdomain} currentDeployment={project.currentDeployment || ""} repoURL={project.repoURL} setTab={() => setTabs("overview")} />
					</TabsContent>
					<TabsContent value="settings">
						<ProjectSettings project={project} reDeploy={reDeploy} setTabs={setTabs} />
					</TabsContent>
					<TabsContent value="monitoring">
						<ProjectAnalytics projectId={project._id} />
					</TabsContent>
					<TabsContent value="files">
						<TabFiles projectId={project._id} projectRepo={project.repoURL} deploymentId={deployment?._id} />
					</TabsContent>
				</main>
				<div ref={scrollRef}></div>
			</Tabs>
		</div>

	)
}
