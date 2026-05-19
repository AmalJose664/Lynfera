"use client"

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type FirstProjectDialogProps = {
	open: boolean
	onClose: (open: boolean, dontShowAgain: boolean) => void
}

export function NewUserDesclaimer({ open, onClose, }: FirstProjectDialogProps) {
	const [dontShowAgain, setDontShowAgain] = useState(false)
	const close = (value: boolean) => {
		onClose(value, dontShowAgain)
	}
	return (
		<Dialog open={open} onOpenChange={close}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Desclaimer</DialogTitle>
					<DialogDescription>
						Your project has been created successfully.
					</DialogDescription>
				</DialogHeader>

				<div className="text-sm dark:text-neutral-200 text-neutral-800">
					Note: This platform is intended for experimentation and general usage, and may not always behave reliably.It is not intended for production use or hosting critical applications.
				</div>
				<div className="text-sm dark:text-neutral-200 text-neutral-800">
					Deployments may fail to start, and intermittent errors in build or status reporting can occur.
				</div>
				<div className="">
					<label className="inline-flex items-center gap-2 cursor-pointer">
						<p className="text-sm text-primary">Dont show this again</p>
						<input type="checkbox" className="" onChange={(e) => setDontShowAgain(e.target.checked)} />
					</label>
				</div>
				<DialogFooter>
					<Button onClick={() => close(false)}>
						Got it
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}