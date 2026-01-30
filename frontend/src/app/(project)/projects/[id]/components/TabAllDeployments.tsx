import StatusIcon from "@/components/ui/StatusIcon"
import { getStatusBg, } from "@/lib/moreUtils/combined"
import { useGetProjectDeploymentsQuery } from "@/store/services/deploymentApi"
import Link from "next/link"

import { IoMdGitBranch } from "react-icons/io"
import { CiSearch } from "react-icons/ci"

import NoDeployment from "./NoDeployment"
import { Project, ProjectStatus } from "@/types/Project"
import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"

import PaginationComponent from "@/components/Pagination"
import { IoClipboardOutline, IoRocketOutline } from "react-icons/io5"
import OptionsComponent from "@/components/OptionsComponent"
import { BsArrowUpCircle } from "react-icons/bs"
import { useRouter } from "next/navigation"
import ChangeDeploymentModal from "@/components/modals/ChangeDeployment"
import DeploymentStatusButtons from "@/components/DeploymentStatusButtons"
import { LoadingSpinner2 } from "@/components/LoadingSpinner"
import { FaGlobeAmericas } from "react-icons/fa"

interface AllDeploymentProps {
	projectId: string;
	currentDeployment: string
	repoURL: string;
	subdomain: string;
	setTab: () => void
}

const AllDeployments = ({ projectId, subdomain, currentDeployment, repoURL, setTab }: AllDeploymentProps) => {
	const router = useRouter()
	const [page, setPage] = useState(1)
	const limit = 10
	const { data, isLoading, isError, error } = useGetProjectDeploymentsQuery({ id: projectId, params: { include: "project", page, limit } })
	const { data: deployments = [], meta } = data ?? {};


	const [search, setSearch] = useState("")
	const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null)
	const [statuses, setStatuses] = useState<Record<string, boolean>>(
		Object.fromEntries(Object.values(ProjectStatus).map((stats) => [stats, true]))
	)

	const { filteredDeployments, statusCounts } = useMemo(() => {
		if (!deployments) return { filteredDeployments: [], statusCounts: {} }
		const counts: Record<string, number> = {}
		Object.values(ProjectStatus).forEach((status) => {
			counts[status] = 0
		})

		const filtered = deployments.filter((d) => {
			if (counts[d.status] !== undefined) {
				counts[d.status]++
			}
			if (!statuses[d.status]) return false

			const searchLower = search.toLowerCase()
			const matchesSearch = !search ||
				d._id.toLowerCase().includes(searchLower) ||
				d.publicId.toLowerCase().includes(searchLower) ||
				d.commit.id?.toLowerCase().includes(searchLower) ||
				d.commit.msg?.toLowerCase().includes(searchLower) ||
				(d.project as Project).name.toLowerCase().includes(searchLower)
			return matchesSearch
		})
		return { filteredDeployments: filtered, statusCounts: counts }
	}, [deployments, search, statuses])

	const totalPages = meta?.totalPages
	return (
		<div>
			{selectedDeploymentId && <ChangeDeploymentModal setSelectedDeploymentId={setSelectedDeploymentId} selectedDeploymentId={selectedDeploymentId} projectId={projectId} />}

			<div className="relative flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
				<div className="relative w-full sm:w-[90%] cats_intheworld">
					<CiSearch className="absolute top-2 left-3 size-5" />
					<Input value={search} onChange={(e) => setSearch(e.target.value)}
						className="mb-4 pl-12 w-full dark:bg-neutral-900 bg-white"
						placeholder="Branches, commits, id"
					/>
				</div>

				<DeploymentStatusButtons statuses={statuses} setStatuses={setStatuses} />
			</div>
			<LoadingSpinner2 isLoading={isLoading} />
			<div className="flex items-center mb-4 gap-3 flex-wrap">
				{Object.entries(statusCounts).map((value, i) => (
					(statuses[value[0]] && value[1] > 0) && (
						<div key={i} className={getStatusBg(value[0])[2] + " rounded-full flex items-center"}>
							<span className="dark:text-gray-200 text-gray-700 text-xs px-2 py-1">
								{value[0]}
							</span>
							<span className={getStatusBg(value[0])[1] + " text-black text-xs px-[8px] py-[2px] mr-1 rounded-full"}>
								{value[1]}
							</span>
						</div>
					)
				)
				)}

			</div>

			{filteredDeployments.length !== 0 && (
				<div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-less rounded-md border dark:border-neutral-800 border-neutral-200 bg-neutral-50 dark:bg-neutral-900/50">
					<div className="col-span-2">Status</div>
					<div className="col-span-2">Project</div>
					<div className="col-span-3">Identifier Slug</div>
					<div className="col-span-2">Commit</div>
					<div className="col-span-1 text-center">branch</div>
					<div className="col-span-2 text-right">Actions</div>
				</div>
			)}

			{filteredDeployments?.length !== 0 && filteredDeployments.map((deployment) => (
				<div key={deployment._id} className="group border-b last:border-none divide-y rounded-md dark:bg-neutral-900 mt-2 bg-white divide-gray-800 border-neutral-200 dark:border-neutral-800 hover:bg-blue-50/30 dark:hover:bg-neutral-800/30 transition-colors">
					<Link
						href={"/deployments/" + deployment._id}
						className="grid grid-cols-4 md:grid-cols-11 gap-2 md:gap-4 items-center px-4 py-3 hover:no-underline"
					>
						<div className="md:col-span-2 flex items-center gap-2">
							<StatusIcon status={deployment.status} />
							<span className="text-xs font-medium">{deployment.status}</span>
						</div>
						<div className="md:col-span-2 flex flex-col min-w-0">
							<span className="text-sm truncate text-primary">
								{(deployment.project as Project).name}
							</span>
							<span className="text-[10px] text-neutral-500 font-mono truncate">
								{deployment._id}
							</span>
							{currentDeployment === deployment._id && (
								<span className="py-1 px-2 border w-fit border-blue-500 rounded-full text-[10px] mt-2 text-blue-400">
									current
								</span>
							)}
						</div>


						<div className="hidden md:flex md:col-span-2 flex-col min-w-0">
							<span className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
								{deployment.identifierSlug}
							</span>
						</div>

						<div className="md:col-span-2 flex flex-col md:items-center gap-2 overflow-hidden">
							<code className="text-[10px] w-fit font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-blue-600">
								{deployment.commit.id.substring(0, 7)}
							</code>
							<span className="text-xs text-neutral-500 truncate">{deployment.commit.msg}</span>
						</div>

						<div className=" hidden md:flex md:col-span-1 text-center items-center md:justify-center gap-1 text-xs text-neutral-500">
							<IoMdGitBranch size={12} />
							<div>{(deployment.project as Project).branch}</div>
						</div>

						<div className="md:col-span-2 flex justify-end" onClick={(e) => e.stopPropagation()}>
							<OptionsComponent parentClassName="" options={[
								{
									title: "Promote Deployment",
									actionFn: () => setSelectedDeploymentId(deployment._id),
									className: "",
									isDisabled: deployment.status != ProjectStatus.READY
										|| deployment._id === currentDeployment,
									Svg: BsArrowUpCircle
								},
								{
									title: "Visit Deployment",
									actionFn: () => window.open(`${window.location.protocol}//${subdomain}--${deployment.publicId}.${process.env.NEXT_PUBLIC_PROXY_SERVER}`),
									isDisabled: deployment.status != ProjectStatus.READY,
									className: "",
									Svg: FaGlobeAmericas
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
								{
									title: "Inspect",
									actionFn: () => router.push("/deployments/" + deployment._id),
									className: "",
								},
								{
									title: "View Files",
									actionFn: () => router.push("/deployments/" + deployment._id + "#files"),
									className: "",
								},
							]} />
						</div>

					</Link>
				</div>
			))}

			{meta?.totalPages > 1 && <PaginationComponent page={page} setPage={setPage} totalPages={totalPages} />}
			{((deployments?.length === 0 || !deployments) && !isLoading) && (
				<div>
					<NoDeployment
						buttonAction={setTab}
						titleText="No Deployments Yet"
						descriptionText="You haven&apos;t created any project deployment yet. Run your project by creating your new Deployment."
						buttonText="Create Deployment"
						buttonIcon={<IoRocketOutline />}
						learnMoreUrl="#"
					/>
				</div>
			)}
			{(isError && (error as any).status !== 404) && (
				<div className="flex items-center justify-center px-4">
					<div className="border p-4 rounded-md max-w-full">
						<p>Error Loading Deployments</p>
						<p className="wrap-break-word">{(error as any)?.message || (error as { data?: { message?: string } })?.data?.message || "Something went wrong"}</p>
					</div>
				</div>
			)}

		</div>
	)
}
export default AllDeployments
