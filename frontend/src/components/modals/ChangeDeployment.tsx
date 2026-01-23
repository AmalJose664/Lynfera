import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useChangeProjectDeploymentMutation } from "@/store/services/projectsApi"
import { toast } from "sonner"

interface NewDeploymentConfirmBoxProps {
	selectedDeploymentId: string | null,
	projectId: string,
	setSelectedDeploymentId: (val: string | null) => void
	refetchDeply?: () => void
}

const ChangeDeploymentModal = ({ selectedDeploymentId, setSelectedDeploymentId, projectId, refetchDeply }: NewDeploymentConfirmBoxProps) => {
	const [update,] = useChangeProjectDeploymentMutation()
	const handleClick = async () => {
		if (!selectedDeploymentId) return;
		toast.promise(
			update({ newDeployment: selectedDeploymentId, projectId }).unwrap(),
			{
				loading: "Updating deployment...",
				success: () => { refetchDeply && refetchDeply(); return "Deployment updated!" },
				error: (err) => "Error updating: " + err?.data?.message || "Unknown error",
			}
		);
	}
	return (
		<div>
			<AlertDialog open={!!selectedDeploymentId}
				onOpenChange={(val) => { setSelectedDeploymentId(val ? selectedDeploymentId : null) }}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Update Project Current Deployment</AlertDialogTitle>
						<AlertDialogDescription>
							This will make changes to your current project.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="flex flex-row items-center gap-2 w-full">
						<AlertDialogCancel className="flex-1 sm:flex-none sm:min-w-24 mt-0">
							Cancel
						</AlertDialogCancel>

						<AlertDialogAction
							onClick={handleClick}
							className="flex-1 sm:flex-none sm:min-w-24"
						>
							Update
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
export default ChangeDeploymentModal