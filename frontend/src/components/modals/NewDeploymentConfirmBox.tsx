import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Project } from "@/types/Project"
interface NewDeploymentConfirmBoxProps {
	showConfirm: boolean,
	setShowConfirm: (val: boolean) => void
	project: Project
	handleClick: () => void
	setTabs: (tab: string) => void
}

const NewDeploymentConfirmBox = ({ showConfirm, setShowConfirm, project, handleClick, setTabs }: NewDeploymentConfirmBoxProps) => {
	const preProjectObj: Partial<Project> = { ...project }
	delete preProjectObj.deployments
	delete preProjectObj._id
	delete preProjectObj.createdAt
	delete preProjectObj.currentDeployment
	delete preProjectObj.lastDeployedAt
	delete preProjectObj.lastDeployment
	delete preProjectObj.tempDeployment
	delete preProjectObj.techStack
	delete preProjectObj.isDeleted
	delete preProjectObj.isDisabled
	delete preProjectObj.updatedAt
	delete preProjectObj.user
	delete preProjectObj.status

	return (
		<div>
			<AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm New Deployment</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you to make a new Deployment
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div>
						<p className="text-less text-sm">
							To change options go to settings.
						</p>
						<div className="mt-4 border rounded-md p-3 max-h-80 overflow-auto shadow-inner">
							<pre className="text-sm text-primary whitespace-pre-wrap">
								{JSON.stringify(preProjectObj, null, 4)}
							</pre>
						</div>
					</div>
					<AlertDialogFooter className="flex flex-row items-center gap-2 w-full">
						<AlertDialogCancel className="flex-1 sm:flex-none sm:min-w-20 mt-0">
							Cancel
						</AlertDialogCancel>

						<AlertDialogAction
							onClick={() => {
								setShowConfirm(false)
								setTabs("settings")
							}}
							className="flex-1 sm:flex-none sm:min-w-20 bg-secondary text-secondary-foreground hover:bg-secondary/80"
						>
							Settings
						</AlertDialogAction>

						<AlertDialogAction
							onClick={handleClick}
							className="flex-1 sm:flex-none sm:min-w-20"
						>
							Deploy
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
export default NewDeploymentConfirmBox