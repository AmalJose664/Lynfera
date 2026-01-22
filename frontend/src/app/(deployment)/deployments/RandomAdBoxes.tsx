
import Link from "next/link"
import { IoIosCube } from "react-icons/io"
import { Project } from "@/types/Project"
import { IoSettingsOutline } from "react-icons/io5"
import { IPlans, PLANS } from "@/config/plan"
import { Button } from "@/components/ui/button"
import RightFadeComponent from "@/components/RightFadeComponent"
import { DeploymentBasic } from "@/types/Deployment"
import { User } from "@/types/User"
import { VscGraphLine } from "react-icons/vsc"
import { memo } from "react"

const RandomAdBoxes = memo(({ deployments, user, statusCounts }: { deployments: DeploymentBasic[], user?: User, statusCounts: Record<string, number> }) => {
	if (deployments.length <= 0) {
		return ''
	}
	const counts = new Map<string, { prjt: { name: string, _id: string }, count: number }>()
	deployments.forEach((d) => {
		const p = d.project as Project
		counts.set(p._id, { count: (counts.get(p._id)?.count || 0) + 1, prjt: { name: p.name, _id: p._id } });
	})
	let topProjectName;
	let topProjectId;
	let max = 0;
	for (const [_, prjt] of counts) {
		if (prjt.count > max) {
			max = prjt.count;
			topProjectName = prjt.prjt.name
			topProjectId = prjt.prjt._id
		}
	}
	return (
		<div className="w-full mt-20 pt-4 flex  md:flex-row flex-col gap-4 items-center overflow-x-clip">
			<RightFadeComponent delay={.6} distance={100} className="rounded-md dark:bg-neutral-900 mt-2 bg-white border-neutral-200 dark:border-neutral-800 hover:bg-blue-50/30 dark:hover:bg-neutral-800/30 border p-4 hover:border-neutral-300
							 dark:hover:border-neutral-700 w-full ">

				<div className="flex items-center justify-between pb-4">
					<div className="space-y-0.5">
						<h4 className="text-sm font-medium tracking-tight text-neutral-950 dark:text-neutral-100">
							Build Status
						</h4>
					</div>

					<Link
						href="/user/plan"
						className="border rounded-sm border-neutral-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-100 dark:hover:text-black"
					>
						{user?.plan || "Free"}
					</Link>
				</div>

				<div className="h-[1px] w-full bg-neutral-100 dark:bg-neutral-800" />

				<div className="flex items-center justify-between pt-4 gap-3">
					<span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
						Concurrent Builds
					</span>
					<div className="flex items-baseline gap-1">
						<span className="text-xl font-mono font-semibold text-neutral-950 dark:text-neutral-100">
							{statusCounts.BUILDING + statusCounts.QUEUED}
						</span>
						<span className="text-xs text-neutral-400 dark:text-neutral-600">
							/ {PLANS[(user?.plan || "FREE") as keyof IPlans].concurrentBuilds}
						</span>
					</div>
				</div>
				<div className="flex items-center justify-between pt-4 gap-3">

					<Button variant={"ghost"} className="border rounded-md flex items-center justify-between gap-3">
						<IoSettingsOutline className="text-primary size-4" />
						<Link
							href="/user/plan"
							className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-100 dark:hover:text-black"
						>
							Manage build capacity
						</Link>
					</Button>
				</div>
			</RightFadeComponent>
			<RightFadeComponent delay={.8} distance={100} className="rounded-md dark:bg-neutral-900 mt-2 bg-white border-neutral-200 dark:border-neutral-800 hover:bg-blue-50/30 dark:hover:bg-neutral-800/30 border p-4 hover:border-neutral-300
							 dark:hover:border-neutral-700 w-full">

				<div className="flex items-center justify-between pb-4">
					<div className="space-y-0.5">
						<h4 className="text-sm font-medium tracking-tight text-neutral-950 dark:text-neutral-100">
							Top Project
						</h4>
					</div>

					<VscGraphLine size={20} />
				</div>

				<div className="h-[1px] w-full bg-neutral-100 dark:bg-neutral-800" />

				<div className="flex items-center justify-between pt-4 gap-3">
					<span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
						{topProjectName}
					</span>
					<div className="flex items-baseline gap-1">
						<span className="text-xl font-mono font-semibold text-neutral-950 dark:text-neutral-100">
							{max}
						</span>
						<span className="text-sm text-neutral-400 dark:text-neutral-600">
							/ {deployments.length}
						</span>
					</div>
				</div>
				<div className="flex items-center justify-between pt-4 gap-3">

					<Button variant={"ghost"} className="border rounded-md flex items-center justify-between gap-3">
						<IoIosCube className="text-primary size-4" />
						<Link
							href={"/projects/" + topProjectId}
							className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-100 dark:hover:text-black"
						>
							View
						</Link>
					</Button>
				</div>
			</RightFadeComponent>
		</div>
	)
},)

export default RandomAdBoxes