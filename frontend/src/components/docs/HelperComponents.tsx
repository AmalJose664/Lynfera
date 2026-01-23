import { cn } from "@/lib/utils"
import Link from "next/link"

export const CodeComponent = ({ children }: { children: React.ReactNode }) => {
	return <code className="mx-1 dark:bg-neutral-700 bg-neutral-300 px-1 rounded-xs py-[1px]">{children}</code>
}
export const LinkComponent = ({ href, children, newPage, className, asA }: { href: string, asA?: boolean, className?: string, newPage?: boolean, children: React.ReactNode }) => {
	if (asA) {
		return <a href={href}
			target={newPage ? "_blank" : "_self"}
			className={cn("border border-transparent hover:border-current dark:text-sky-300 text-sky-500 px-1 rounded-xs py-[1px]", className)}>{children}</a>
	}
	return <Link href={href}
		target={newPage ? "_blank" : "_self"}
		className={cn("border border-transparent hover:border-current dark:text-sky-300 text-sky-500 px-1 rounded-xs py-[1px]", className)}>{children}</Link>
}
