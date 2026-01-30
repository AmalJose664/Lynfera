

import { IoMdGitBranch } from "react-icons/io";
import { LiaExternalLinkAltSolid } from "react-icons/lia";
import { MdAccessTime } from "react-icons/md";
import { Deployment } from "@/types/Deployment";
import { formatDuration, getElapsedTime, getGithubBranchUrl, getGithubCommitUrl, getStatusColor, shortHash, } from "@/lib/moreUtils/combined";
import Link from "next/link";
import StatusIcon from "@/components/ui/StatusIcon";
import { useRouter } from "next/navigation";
import RightFadeComponent from "@/components/RightFadeComponent";


interface ProjectDeploymentProps {
	deployment: Deployment;
	projectBranch: string;
	repoURL: string
	showLogs: () => void
	type: "Progress" | "Current" | "Last"
}

const ProjectDeploymentBox = ({ deployment, projectBranch, repoURL, showLogs, type }: ProjectDeploymentProps) => {
	const router = useRouter()
	return (
		<RightFadeComponent delay={.1} inView className="border  rounded-xl overflow-hidden dark:bg-neutral-900 bg-white mb-4">
			<div className="px-6 py-4 border-b">
				<h2 className="text-lg font-semibold">{type} Deployment</h2>
			</div>


			<div className="divide-y divide-gray-800" onClick={() => router.push("/deployments/" + deployment._id)}>
				<div
					className="px-6 py-4 hover:bg-secondary/50 transition-colors cursor-pointer"
				>
					<div className="flex items-start justify-between">
						<div className="flex items-start gap-4 flex-1">
							<div className="pt-1"><StatusIcon status={deployment.status} /></div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-3 mb-2">
									<span
										className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(
											deployment.status
										)}`}
									>
										{deployment.status}
									</span>
									<span className="text-xs  font-mono">
										{shortHash(deployment.commit.id)}
									</span>
									<span className="text-xs text-gray-500">{getElapsedTime(deployment.completedAt || deployment.createdAt)}{"  "}ago</span>
								</div>
								<Link href={getGithubCommitUrl(repoURL, shortHash(deployment.commit.id))} target="_blank" className="hover:underline text-sm text-primary mb-1">{shortHash(deployment.commit.id)}</Link>
								<div className="flex items-center gap-4 text-xs text-gray-400">
									<div className="flex items-center text-xs gap-1.5">
										<IoMdGitBranch size={12} />
										<Link target="_blank" href={getGithubBranchUrl(repoURL, projectBranch)} className="hover:undeline">{projectBranch}</Link>
									</div>
									<div className="flex items-center text-xs gap-1.5">
										<MdAccessTime size={12} />
										<span>{formatDuration(deployment.performance.totalDuration)}</span>
									</div>
								</div>
							</div>
						</div>
						<button onClick={showLogs} className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
							View Logs
							<LiaExternalLinkAltSolid size={12} />
						</button>
					</div>
				</div>
			</div>
		</RightFadeComponent>
	)
}
export default ProjectDeploymentBox