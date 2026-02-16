"use client";
import Link from "next/link";
import { navbarLinks } from "@/config/constants";
import { useIsDesktop } from "@/hooks/useIsDesktop";
const NavbarLinks = ({ showOtherLinks }: { showOtherLinks?: boolean }) => {
	const isDesktop = useIsDesktop();

	if (!isDesktop) return null;

	return (
		<ul className="hidden md:flex items-center gap-6 text-sm dark:text-white text-black">
			{navbarLinks.map(({ Icon, ...link }, i) => {
				if (link.isOtherLink && !showOtherLinks) return null;
				if (link.hidden) return
				return (<li key={i}>
					<Link href={link.url} className="hover:text-blue-400 flex gap-2 items-center">
						{Icon && <Icon />}
						{link.name}
					</Link>
				</li>)
			}
			)}
		</ul>
	)
}
export default NavbarLinks