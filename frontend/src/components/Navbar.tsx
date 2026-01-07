import Link from "next/link";
import ThemeSwitcher from "./ThemeIcon";
import { cn } from "@/lib/utils";
import { IoIosCube, IoMdCloudDone } from "react-icons/io";
import NavbarUser from "./NavbarUser";
import TitleWithLogo from "./TitleWithLogo";
import ActivityPanel from "./ActivityPanel";

export default function Navbar({ className, showOtherLinks }: { className: string, showOtherLinks?: boolean }) {

	return (
		<nav className={cn(className, "flex w-full items-center justify-between px-6 py-3 border-b dark:border-gray-800 border-gray-300")}>
			<div className="flex items-center space-x-3">
				<svg
					className="h-4 w-4 text-gray-400 rotate-x-180"
					viewBox="0 0 16 16"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z"
					/>
				</svg>

				<Link
					href="/"
					className="flex items-center space-x-2 hover:no-underline transition"
				>
					<TitleWithLogo useSvg />
				</Link>
				<svg
					className="h-4 w-4 text-gray-400"
					viewBox="0 0 16 16"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z"
					/>
				</svg>
			</div>


			<div className="flex items-center gap-6">

				<ul className="hidden md:flex items-center gap-6 text-sm dark:text-white text-black">
					<li>
						<Link href="/projects" className="hover:text-blue-400 flex gap-2 items-center">
							<IoIosCube />Projects
						</Link>
					</li>
					<li>
						<Link href="/deployments" className="hover:text-blue-400 flex gap-2 items-center">
							<IoMdCloudDone />Deployments
						</Link>
					</li>
					{showOtherLinks &&
						<li>
							<Link href="/pricing" className="hover:text-blue-400">
								Pricing
							</Link>
						</li>
					}
					{showOtherLinks &&
						<li>
							<Link href="/product" className="hover:text-blue-400">
								Product
							</Link>
						</li>
					}
					<li>
						<Link href="/docs" className="hover:text-blue-400">
							Docs
						</Link>
					</li>
				</ul>
				<ActivityPanel />
				<ThemeSwitcher className="rounded-full" />

				<NavbarUser />

			</div>
		</nav>
	);
}
