import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useUpdateProjectMutation } from "@/store/services/projectsApi"
import { toast } from "sonner"


const DisableProject = ({ projectId, isDisabled }: { projectId: string, isDisabled: boolean }) => {
	const [updateProject, { error }] = useUpdateProjectMutation()
	const changeProjectStatus = async (condition: boolean) => {
		try {
			updateProject({ _id: projectId, isDisabled: condition }).unwrap()
			toast.success(`${condition ? "Disabled" : "Enabled"} project`)
		} catch (error) {
			toast.error("error on  project action")
			console.log(error)
		}
	}
	return (<>
		{isDisabled ? (
			<AlertDialog>
				<AlertDialogTrigger className="text-blue-400 border border-blue-400 text-sm px-3 py-1 rounded-md bg-background hover:bg-green-50 dark:hover:bg-[#1a1a1a]">
					Enable Project
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Enable this project?</AlertDialogTitle>
						<AlertDialogDescription>
							Your project will be accessible and deployments will resume.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="flex flex-row items-center gap-2 w-full">
						<AlertDialogCancel className="flex-1 sm:flex-none sm:min-w-24 mt-0">
							Cancel
						</AlertDialogCancel>

						<AlertDialogAction
							onClick={() => changeProjectStatus(false)}
							className="flex-1 sm:flex-none sm:min-w-24 border-blue-400 border bg-blue-400 hover:bg-blue-500"
						>
							Enable
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		) : (
			<AlertDialog>
				<AlertDialogTrigger className="text-red-500 border border-red-400 text-sm px-3 py-1 rounded-md bg-background hover:bg-red-50 dark:hover:bg-[#1a1a1a]">
					Disable Project
				</AlertDialogTrigger >
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							Your project will not be accessible until you reset.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="flex flex-row items-center gap-2 w-full">
						<AlertDialogCancel className="flex-1 sm:flex-none sm:min-w-24 mt-0">
							Cancel
						</AlertDialogCancel>

						<AlertDialogAction
							onClick={() => changeProjectStatus(true)}
							className="flex-1 sm:flex-none sm:min-w-24 border-red-500 border bg-red-400"
						>
							Disable
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog >
		)}
	</>

	)
}
export default DisableProject