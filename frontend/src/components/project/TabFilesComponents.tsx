import { FaRegFileAlt } from "react-icons/fa"
import { RiFileWarningLine } from "react-icons/ri"

export const TabFilesLoading = () => {
	return (
		<div><div className="flex flex-col gap-2 dark:bg-[#111111] border items-center justify-center bg-white text-neutral-400 p-8 rounded-lg text-center">
			<RiFileWarningLine size={22} />  <p>Loading.....</p>
			<div className="space-y-1 w-full">
				{[1, 1, 1, 1, 1, 1, 1].map((_, index) => (
					<div
						key={index}
						className="flex border items-center  justify-between group gap-4 py-2 px-3 hover:bg-secondary rounded"
					>
						<div className="flex items-center gap-2 animate-pulse group-hover:border flex-1 min-w-0">
							<FaRegFileAlt size={16} className="text-less shrink-0" />
							<span className="text-some-less text-sm group-hover:border truncate rounded-md bg-secondary w-[30%] h-4 ">{''}</span>
						</div>
						<span className="text-less text-xs shrink-0">
							{''}
						</span>
					</div>
				))}
			</div>
		</div></div>
	)
}
export const TabFilesNoDeployment = () => {
	return (
		<div className="flex flex-col gap-2 dark:bg-[#111111] border items-center justify-center bg-white text-neutral-400 p-8 rounded-lg text-center">
			<RiFileWarningLine size={22} />  <p>No deployment to show files</p>
			<div className="space-y-1 w-full">
				{[1, 1, 1, 1, 1, 1, 1].map((_, index) => (
					<div
						key={index}
						className="flex border items-center  justify-between group gap-4 py-2 px-3 hover:bg-secondary rounded"
					>
						<div className="flex items-center gap-2  group-hover:border flex-1 min-w-0">
							<FaRegFileAlt size={16} className="text-less shrink-0" />
							<span className="text-some-less text-sm group-hover:border truncate rounded-md bg-secondary w-[30%] h-4 ">{''}</span>
						</div>
						<span className="text-less text-xs shrink-0">
							{''}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
export const TabFilesDeploymentFailure = () => {
	return (
		<div className="flex flex-col gap-2 dark:bg-[#111111] border items-center justify-center bg-white text-neutral-400 p-8 rounded-lg text-center">
			<RiFileWarningLine size={22} />  <p>No Active Successful deployments</p>
		</div>
	);
}

export const TabFilesNoFiles = () => {
	return (
		<div className="flex gap-2 dark:bg-[#111111] border items-center justify-center bg-white text-neutral-400 p-8 rounded-lg text-center">
			<RiFileWarningLine size={22} />  <p>No files available for this deployment currently</p>
		</div>
	);
}
export const TabFilesError = ({ error }: { error: any }) => {
	if (error.status === 404) {
		return <TabFilesNoFiles />
	}
	return (
		<div className="flex gap-2 dark:bg-[#111111] border items-center justify-center bg-white text-neutral-400 p-8 rounded-lg text-center">
			<RiFileWarningLine size={22} />  <p className="text-less mb-4">

				{(error as any)?.message || (error as { data?: { message?: string } })?.data?.message || "Something went wrong"}
			</p>
		</div>
	);
}