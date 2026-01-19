
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
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Copybtn from "../Copybtn"
import { useClearAnalyticsMutation } from "@/store/services/analyticsApi"

export function ClearAnalyticsDialog({ projectName, projectId }: { projectName: string, projectId: string }) {
	const [userConfirmText, setUserConfirmText] = useState("")
	const [open, setOpen] = useState(false)
	const [clearAnalytics, data] = useClearAnalyticsMutation()
	const ref = useRef<HTMLButtonElement>(null)
	const router = useRouter()
	const confirmText = "delete analytics " + projectName
	const handleDelete = async () => {
		if (userConfirmText === confirmText) {
			try {
				const result = await clearAnalytics({ projectId }).unwrap()
				console.log("Deleted:", result)
				toast.success(`Project ${projectName} analytics has been deleted.`)
				router.push("/projects/" + projectId)
			} catch (err) {
				console.error("Delete failed:", err)
				toast.error("Failed to delete analytics")
				ref.current?.click()
			} finally {
				setUserConfirmText("")
				setOpen(false)
			}

		} else {
			toast.error("Project name does not match")
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="text-red-500 border border-red-400 text-sm px-3 py-1 rounded-md bg-background hover:bg-red-50 dark:hover:bg-[#1a1a1a]" size="sm">
					Clear Data
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Clear All Analytics Data</DialogTitle>
					<DialogDescription>
						<span className="text-red-400/90">
							This action will permanently delete all analytics data for this project.
							You will lose access to all analytics collected up to this point.
						</span>
						<br />
						To confirm, type delete analytics 'project name' below:
						<br />
					</DialogDescription>
					<div className="flex items-center gap-3 text-sm">
						{confirmText} <Copybtn value={confirmText} />
					</div>
				</DialogHeader>

				<div className="py-4">
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