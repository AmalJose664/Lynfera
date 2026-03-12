
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
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Copybtn from "../Copybtn"
import { useRemoveUserGithubAppMutation } from "@/store/services/authApi";

export function RemoveGithubAppDialog({ }: { projectName: string, projectId: string, currentSubdomain: string }) {
	const [userConfirmText, setUserConfirmText] = useState("")

	const ref = useRef<HTMLButtonElement>(null)
	const confirmText = "remove github app"
	const [removeFn, { isLoading, }] = useRemoveUserGithubAppMutation()
	const handleRemoveClick = async () => {
		try {
			removeFn().unwrap()
		} catch (error) {
			console.log(error)
		} finally {

		}
	}

	return (
		<Dialog >
			<DialogTrigger asChild>
				<Button variant={"outline"} className="text-sm border px-4 py-2 mt-2 text-red-400" size="sm">
					Remove App
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Remove Github</DialogTitle>
					<DialogDescription>
						To confirm, type 'remove github app' below:
					</DialogDescription>

				</DialogHeader>

				<div className="py-4 space-y-4">
					<div >
						<label className="flex items-center gap-3 text-sm">
							Type  <strong>'{confirmText}'</strong>  <Copybtn value={confirmText} />
						</label>
						<Input
							placeholder={`Type "${confirmText}"`}
							value={userConfirmText}
							onChange={(e) => setUserConfirmText(e.target.value)}
							className="font-mono mt-2"
						/>
					</div>
				</div>

				<DialogFooter className="flex flex-row items-center gap-2 w-full">
					<DialogClose asChild>
						<Button ref={ref} variant="outline" className="flex-1 sm:flex-none sm:min-w-24">Cancel</Button>
					</DialogClose>

					<Button variant={"outline"}
						className="flex-1 sm:flex-none sm:min-w-24 text-primary border text-sm px-3 py-1 rounded-md bg-background hover:bg-red-50 dark:hover:bg-[#1a1a1a] min-w-20"
						disabled={userConfirmText !== confirmText || isLoading}
						onClick={handleRemoveClick}
					>
						{isLoading ? <AiOutlineLoading3Quarters className="animate-spin" /> : "Remove"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}