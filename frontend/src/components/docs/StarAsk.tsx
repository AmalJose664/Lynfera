"use client"
import { LINKS } from "@/config/constants"
import { usePathname } from "next/navigation"

export const StartsAsk = () => {
	const pathName = usePathname()
	if (pathName === "/docs") return null
	return (
		<div className="mt-20 mb-8 border-t pt-8 text-center text-sm text-gray-600">
			<p>
				Enjoying the docs? If our platform has been helpful,
				consider giving us a ⭐ on GitHub — it is really appreciated!
			</p>
			<a
				href={LINKS.REPO}
				target="_blank"
				rel="noopener noreferrer"
				className="mt-3 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-less hover:bg-secondary transition"
			>
				⭐ Star us on GitHub
			</a>
		</div>
	)
}
export default StartsAsk