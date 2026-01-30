import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useDeleteDeploymentMutation } from "@/store/services/deploymentApi"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction } from "react"
import { toast } from "sonner"

interface NewDeploymentConfirmBoxProps {
	deploymentId: string,
	projectId: string,
	showDeleteDeplymntModal: boolean
	setShowDeleteDeplymntModal: Dispatch<SetStateAction<boolean>>
}

const DeleteDeploymentModal = ({ deploymentId, projectId, showDeleteDeplymntModal, setShowDeleteDeplymntModal }: NewDeploymentConfirmBoxProps) => {
	const [deleteDpymnt,] = useDeleteDeploymentMutation()
	const router = useRouter()
	const handleClick = async () => {
		toast.promise(
			deleteDpymnt({ deploymentId, projectId }).unwrap(),
			{
				loading: "Deleting deployment...",
				success: () => { router.back(); return ("Deployment Deleted !") },
				error: (err) => "Error while delete : " + err?.data?.message || "Unknown error",
			}
		);
	}
	return (
		<div>
			<AlertDialog open={showDeleteDeplymntModal}
				onOpenChange={setShowDeleteDeplymntModal}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Failed Deployment</AlertDialogTitle>
						<AlertDialogDescription>
							Deleting a <strong>Failed</strong> deployment permanently removes it from your project’s deployment history. All associated logs and build artifacts will also be deleted and cannot be recovered.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="flex flex-row items-center gap-2 w-full">
						<AlertDialogCancel className="flex-1 sm:flex-none sm:min-w-24 mt-0">
							Cancel
						</AlertDialogCancel>

						<AlertDialogAction
							onClick={handleClick}
							className="flex-1 sm:flex-none sm:min-w-24 bg-red-400"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
export default DeleteDeploymentModal