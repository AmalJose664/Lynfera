import { BsGlobe2, BsActivity, BsHddNetwork, } from "react-icons/bs";
import { IoIosTrendingDown } from "react-icons/io";
import { MdOutlineCheckCircle, MdAccessTime, MdErrorOutline } from "react-icons/md";
import { Project } from "@/types/Project";
import RightFadeComponent from "@/components/RightFadeComponent";
import { useGetProjectsSimpleStatsQuery } from "@/store/services/projectsApi";
import { formatBytes, formatDuration, getElapsedTimeClean, getStatusColor } from "@/lib/moreUtils/combined";
import { StatusHistory, SubtleProgressBar, ThinSparkline } from "@/components/SimpleStatsCompnts";
import { LuHistory } from "react-icons/lu";
import { HiOutlineArrowLongRight } from "react-icons/hi2";
import { cn } from "@/lib/utils";
const ProjectSimpleStats = ({ project }: { project: Project }) => {

	const { data } = useGetProjectsSimpleStatsQuery(project._id)
	const mockStats = {
		totalDeployments: data?.totalDeployments || project.deployments?.length,
		successRate: data?.successRate || 0,
		failureRate: data?.failureRate || 0,
		avgBuildTime: data?.avgBuildTime || 0,
		lastDeployed: getElapsedTimeClean(data?.lastDeployed || undefined),
		bandwidth: data?.bandwidth || 0,
		buildHistory: data?.buildHistory,
		failedBuilds: data?.failedBuilds

	};
	return (
		<RightFadeComponent delay={.1} inView >
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">

				<div className="border rounded-lg p-3 dark:bg-zinc-900/50 bg-white h-22 flex flex-col justify-between relative overflow-hidden">
					<div className="flex items-center gap-1.5">
						<BsActivity className="text-neutral-400" size={13} />
						<span className="text-[11px] font-medium text-less uppercase tracking-wider">Deploys</span>
					</div>
					<div className="flex items-end justify-between z-10">
						<p className="text-xl font-mono font-semibold tracking-tight text-primary">{mockStats.totalDeployments}</p>
						<div className="mb-0.5">
							<ThinSparkline data={[0, 1, 20, 30, 90, 0]} />
						</div>
					</div>
				</div>

				<div className="border  rounded-lg p-3 dark:bg-zinc-900/50 bg-white h-22 flex flex-col justify-between">
					<div className="flex justify-between items-start">
						<div className="flex items-center gap-1.5">
							<MdOutlineCheckCircle className="text-emerald-400" size={14} />
							<span className="text-[11px] font-medium text-less uppercase tracking-wider">Success Rate</span>
						</div>
					</div>
					<div>
						<div className="flex items-baseline gap-1">
							<p className="text-xl font-mono font-semibold tracking-tight text-primary">{mockStats.successRate}</p>
							<span className="text-xs font-mono text-primary">%</span>
						</div>
						<SubtleProgressBar percentage={mockStats.successRate} color="bg-emerald-500/80" />
					</div>
				</div>
				<div className="border  rounded-lg p-3 dark:bg-zinc-900/50 bg-white h-22 flex flex-col justify-between">
					<div className="flex justify-between items-start">
						<div className="flex items-center gap-1.5">
							<MdErrorOutline className="text-red-400" size={14} />
							<span className="text-[11px] font-medium text-less uppercase tracking-wider">Failure Rate</span>
						</div>
					</div>
					<div>
						<div className="flex items-baseline gap-1">
							<p className="text-xl font-mono font-semibold tracking-tight text-primary">{mockStats.failureRate}</p>
							<span className="text-xs font-mono text-primary">%</span>
						</div>
						<SubtleProgressBar percentage={mockStats.failureRate} color="bg-red-600/80" />
					</div>
				</div>
				<div className="border  rounded-lg p-3 dark:bg-zinc-900/50 bg-white h-22 flex flex-col justify-between">
					<div className="flex justify-between items-start">
						<div className="flex items-center gap-1.5">
							<MdErrorOutline className="text-neutral-400" size={14} />
							<span className="text-[11px] font-medium text-less uppercase tracking-wider">Failed Builds</span>
						</div>
					</div>
					<div className="flex items-center justify-between">
						<p className="text-xl font-mono font-semibold tracking-tight text-primary">{mockStats.failedBuilds}</p>
						<ThinSparkline data={[100, 2, 0]} />
					</div>
				</div>


				<div className="border  rounded-lg p-3 dark:bg-zinc-900/50 bg-white h-22 flex flex-col justify-between">
					<div className="flex items-center gap-1.5">
						<BsHddNetwork className="text-neutral-400" size={13} />
						<span className="text-[11px] font-medium text-less uppercase tracking-wider">Bandwidth</span>
					</div>
					<div>
						<p className="text-xl font-semibold tracking-tight text-primary">{formatBytes(mockStats.bandwidth)} </p>
					</div>
				</div>

				<div className="border  rounded-lg p-3 dark:bg-zinc-900/50 bg-white h-22 flex flex-col justify-between">
					<div className="flex items-center gap-1.5">
						<MdAccessTime className="text-neutral-400" size={14} />
						<span className="text-[11px] font-medium text-less uppercase tracking-wider">Avg Build Time</span>
					</div>
					<div className="flex items-end justify-between">
						<p className="text-xl font-mono font-semibold tracking-tight text-primary">{formatDuration(mockStats.avgBuildTime)}</p>
						<div className="flex items-center text-emerald-500/80 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded text-[10px] font-medium">
							<IoIosTrendingDown size={10} className="mr-0.5" /> Faster
						</div>
					</div>
				</div>

				<div className="border rounded-lg p-3 dark:bg-zinc-900/50 bg-white h-22 flex flex-col justify-between">
					<div className="flex items-center gap-1.5">
						<BsGlobe2 className="text-neutral-400" size={13} />
						<span className="text-[11px] font-medium text-less uppercase tracking-wider">Latest Deploy</span>
					</div>
					<p className="text-base font-mono font-medium text-primary">{mockStats.lastDeployed} ago</p>
				</div>

				<div className="border rounded-lg p-3 dark:bg-zinc-900/50 bg-white h-22 flex flex-col">
					<div className="flex justify-between items-start">
						<div className="flex items-center gap-1.5">
							<LuHistory className="text-neutral-400" size={14} />
							<span className="text-[11px] font-medium text-less uppercase tracking-wider">Builds History</span>
						</div>
					</div>
					<div className="mt-5 flex flex-col items-center">
						<HiOutlineArrowLongRight className={cn("animate-pulse", getStatusColor(project.status))} />
						<StatusHistory statuses={mockStats.buildHistory || []} />
					</div>
				</div>
			</div>
		</RightFadeComponent>
	)
}
export default ProjectSimpleStats

