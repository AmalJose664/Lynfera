"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const EachLink = ({ item }: { item: { url: string, label: string } }) => {
	const pathName = usePathname()
	const end = pathName.split("/")[2]
	return (
		<li
			className={cn("border border-transparent dark:hover:border-neutral-700 hover:border-neutral-300 mr-4 rounded-md",
				end === item.url ? "border-gray-500" : ""
			)}>
			<Link
				href={`/docs/${item.url}`}
				className={cn("block px-4 py-2 text-sm font-medium text-some-less hover:text-primary hover:no-underline rounded-lg transition-colors",
					end === item.url ? "text-primary" : ""
				)}
			>{item.label}
			</Link>
		</li>
	)
}
export default EachLink