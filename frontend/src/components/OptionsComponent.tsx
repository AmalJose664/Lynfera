
"use client"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { FiMoreHorizontal } from "react-icons/fi"

interface OptionsComponentProps {
	parentClassName?: string,
	iconSize?: number,
	className?: string,
	options: {
		title: string,
		Svg?: React.ComponentType,
		className: string,
		actionFn: () => void
		isDisabled?: boolean
	}[]
}
const OptionsComponent = ({ options, parentClassName, iconSize, className }: OptionsComponentProps) => {
	return (
		<div className={cn("mr-4", className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className="p-2 hover:bg-secondary rounded-lg transition-colors border !duration-150">
						<FiMoreHorizontal size={iconSize || 20} />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className={cn("", parentClassName)} align="start"
					side="left">
					<DropdownMenuGroup className="space-y-1 m-1">
						{options.map(({ Svg, ...opt }, index) => (
							<DropdownMenuItem disabled={opt.isDisabled} key={index} className={cn(opt.className,
								"cursor-pointer border border-transparent dark:hover:border-neutral-700 hover:border-neutral-300")} onClick={opt.actionFn}>
								{opt.title}
								{Svg && <Svg />}
							</DropdownMenuItem>
						))}
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
export default OptionsComponent