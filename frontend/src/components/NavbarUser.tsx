"use client"
import { HiOutlineTemplate } from "react-icons/hi";
import { SlBookOpen } from "react-icons/sl";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button"
import { useGetUserQuery, useLogoutMutation } from "@/store/services/authApi"
import { RxExternalLink } from "react-icons/rx"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LINKS, navbarLinks } from "@/config/constants"
import ThemeSwitcher from "./ThemeIcon"
import { useIsDesktop } from "@/hooks/useIsDesktop"
import { GiHamburgerMenu } from "react-icons/gi";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import { avatarBgFromName } from "@/lib/moreUtils/combined"
import { deleteCookie } from "cookies-next/client"



const NavbarUser = ({ showOtherLinks }: { showOtherLinks?: boolean }) => {

	const hasCookie = typeof window !== 'undefined' && window.document.cookie.includes('Is_Authenticated_Client')
	const { data: user } = useGetUserQuery(undefined, { skip: !hasCookie })
	const [logout] = useLogoutMutation()
	const isDesktop = useIsDesktop();
	const router = useRouter()
	const logoutAndRedirect = () => {
		deleteCookie("Is_Authenticated_Client")
		logout()
		router.push("/login")
	}
	if (!isDesktop) {
		return (
			<Sheet >
				<SheetTrigger asChild>
					<Button variant="ghost"><GiHamburgerMenu /></Button>
				</SheetTrigger>
				<SheetContent side="right" className="w-[300px] sm:w-[400px]">
					<SheetHeader className="mb-6 text-left">
						<SheetTitle>Menu</SheetTitle>
					</SheetHeader>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<h3 className="text-sm font-medium text-muted-foreground">Navigation</h3>
							{navbarLinks.map(({ Icon, ...link }, i) => {
								if (link.isOtherLink && !showOtherLinks) return null;
								return (
									<SheetClose asChild key={i}>
										<Link href={link.url || "#"} className="flex items-center gap-2 px-2 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors">
											{Icon && <Icon />}
											{link.name}
										</Link>
									</SheetClose>
								)
							})}
						</div>
						<div className="h-px bg-border my-2" />
						<div className="flex flex-col gap-2">
							<h3 className="text-sm font-medium text-muted-foreground">Account</h3>
							<SheetClose asChild>
								<Button
									variant="ghost"
									className="justify-start px-2 w-full gap-2"
									onClick={() => router.push(user ? "/user" : "/login")}
								>
									{user ? (
										<>
											{user.profileImage ? (
												<img
													src={user.profileImage}
													alt="User"
													className="size-6 rounded-full object-cover"
												/>
											) : (
												<div className="size-6 bg-gradient-to-tr from-blue-500 via-background to-yellow-500 rounded-full border" />
											)}

											<span className="text-primary">Profile</span>
										</>
									) : (
										"Login"
									)}
								</Button>
							</SheetClose>
							{!user && (
								<SheetClose asChild>
									<Button variant="ghost" className="justify-start px-2" onClick={() => router.push("/signup")}>
										Signup
									</Button>
								</SheetClose>
							)}
							<div className="px-2 py-1">
								<ThemeSwitcher className="flex items-center gap-2 text-sm" withText />
							</div>
						</div>

						<div className="h-px bg-border my-2" />
						<div className="flex flex-col gap-2">
							<SheetClose asChild>
								<Link target="_blank" href={LINKS.REPO} className="flex items-center gap-2 px-2 py-2 text-sm font-medium hover:bg-accent rounded-md">
									GitHub <RxExternalLink />
								</Link>
							</SheetClose>
						</div>

						{user && (
							<>
								<div className="h-px bg-border my-2" />
								<SheetClose asChild>
									<Button variant="ghost" className="justify-start px-2 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={logoutAndRedirect}>
										Log out
									</Button>
								</SheetClose>
							</>
						)}
					</div>
				</SheetContent>
			</Sheet>
		)
	}
	return (
		<div className="">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="rounded-full size-10 p-0">
						{user?.profileImage
							? (user?.profileImage === "FILL" ? (
								<div className={`uppercase text-white rounded-full w-full h-full flex items-center justify-center ${avatarBgFromName(user.name)}`} >
									{user.name && user.name.slice(0, 2)}
								</div>
							) : (
								<img
									src={user.profileImage}
									alt="User Avatar"
									width={24}
									height={24}
									className="rounded-full"
								/>
							)) : (
								<div className="size-6 bg-gradient-to-tr from-blue-500 via-background to-yellow-500 rounded-full border" />
							)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56 mr-6" align="start">
					<DropdownMenuLabel>Account</DropdownMenuLabel>
					<DropdownMenuGroup>
						<DropdownMenuItem className="cursor-pointer" onClick={() => router.push(user ? "/user" : "/login")}>
							{user ? "Profile" : "Login"}
						</DropdownMenuItem>
						{!user &&
							<DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/signup")}>
								Signup
							</DropdownMenuItem>
						}
						<DropdownMenuItem className="cursor-pointer" onClick={() => ''}>
							<ThemeSwitcher className="flex items-center gap-2" withText />
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem >
						<Link target="" className="flex gap-2 items-center no-underline" href={"/docs"} >
							Docs
							<SlBookOpen />
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Link target="" className="flex gap-2 items-center no-underline" href={"/showcase"} >
							Showcase
							<HiOutlineTemplate />
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem >
						<Link target="_blank" className="flex gap-2 items-center no-underline" href={LINKS.REPO} >
							GitHub
							<RxExternalLink />
						</Link>
					</DropdownMenuItem>

					{user && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => logoutAndRedirect()}>
								Log out
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
export default NavbarUser



