
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRef, useState } from "react"
import { useDeleteProjectMutation } from "@/store/services/projectsApi"
import { useRouter } from "next/navigation"
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { showToast } from "../Toasts"
import Copybtn from "../Copybtn"


export function DeleteProjectDialog({ projectName, projectId }: { projectName: string, projectId: string }) {
	const [userConfirmText, setUserConfirmText] = useState("")
	const [deleteProject, data] = useDeleteProjectMutation()
	const ref = useRef<HTMLButtonElement>(null)
	const router = useRouter()
	const confirmText = "delete " + projectName
	const handleDelete = async () => {
		if (userConfirmText === confirmText) {
			try {
				const result = await deleteProject(projectId).unwrap()
				showToast.success(`Project ${projectName} has been deleted.`)
				router.push("/projects")
			} catch (err) {
				console.error("Delete failed:", err)
				showToast.error("Failed", "Failed to delete project")
				ref.current?.click()
			}

		} else {
			showToast.warning("Project name does not match.")
		}
	}

	return (
		<Dialog >
			<DialogTrigger asChild>
				<Button className="text-red-500 border border-red-400 text-sm px-3 py-1 rounded-md bg-background hover:bg-red-50 dark:hover:bg-[#1a1a1a]" size="sm">
					Delete Project
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Delete Project</DialogTitle>
					<DialogDescription>
						<span className="text-red-400/90">
							This action cannot be undone.
						</span>
						<br />
						To confirm, type delete 'project name' below:
						<br />
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<label className="flex items-center gap-3 text-sm mb-2">
						Type  <strong>'{confirmText}'</strong>  <Copybtn value={confirmText} />
					</label>
					<Input
						placeholder={`Type "${confirmText}"`}
						value={userConfirmText}
						onChange={(e) => setUserConfirmText(e.target.value)}
						className="font-mono"
					/>
				</div>

				<DialogFooter className="flex flex-row items-center gap-2 w-full">
					<DialogClose asChild>
						<Button
							ref={ref}
							variant="outline"
							className="flex-1 sm:flex-none sm:min-w-24"
						>
							Cancel
						</Button>
					</DialogClose>

					<Button
						className="flex-1 sm:flex-none sm:min-w-24 text-red-500 border border-red-400 text-sm px-3 py-1 rounded-md bg-background hover:bg-red-50 dark:hover:bg-[#1a1a1a]"
						disabled={userConfirmText !== confirmText || data.isLoading}
						onClick={handleDelete}
					>
						{data.isLoading ? (
							<AiOutlineLoading3Quarters className="animate-spin" />
						) : (
							"Delete"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}