"use client"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GoBell } from "react-icons/go"
import { Button } from "./ui/button"
import { MdNotificationImportant } from "react-icons/md"

const ActivityPanel = () => {
	return (
		<div className="">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="rounded-full size-10 relative p-2 dark:hover:bg-gray-100 hover:bg-gray-400 border-1 dark:border-gray-800 border-gray-500 dark:text-gray-200 text-gray-800 hover:text-less dark:hover:text-gray-800 duration-200!">
						<GoBell className="" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56 mr-6" align="start">
					<div className="px-4 py-3 flex gap-2 items-center">
						<span className="text-sm text-less">
							No Notifications yet
						</span>
						<MdNotificationImportant />
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
export default ActivityPanel