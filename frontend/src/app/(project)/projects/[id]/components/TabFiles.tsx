
import FilesComponent from "@/components/FilesComponent";
import { ProjectStatus } from "@/types/Project";

interface TabFilesProps {
	projectId: string,
	projectRepo: string,
	deploymentId?: string
	deploymentStatus?: ProjectStatus
}




const TabFiles = ({ projectId, projectRepo, deploymentId, deploymentStatus }: TabFilesProps) => {

	return (
		<div className="border rounded-md px-4 py-6 dark:bg-[#111111] bg-white">
			<FilesComponent projectId={projectId} projectRepo={projectRepo} deploymentId={deploymentId} deploymentStatus={deploymentStatus}>
				<h2 className="text-xl font-semibold mb-1">Build Output Files</h2>
			</FilesComponent>
		</div>
	)
}


export default TabFiles