import Link from "next/link";
import TitleWithLogo from "./TitleWithLogo";
import ThemeSwitcher from '@/components/ThemeIcon';

import { Button } from "./ui/button";
import { LuGithub } from "react-icons/lu";

export const Footer = () => {
	return (
		<footer className="border bg-background pt-16 pb-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
					<div>
						<h3 className="text-primary font-bold mb-4">Product</h3>
						<ul className="space-y-2">
							<li><Link href="/product" className="text-gray-500 hover:text-some-less text-sm">Product</Link></li>
							<li><Link href="/resources" className="text-gray-500 hover:text-some-less text-sm">Analytics</Link></li>
						</ul>
					</div>
					<div>
						<h3 className="text-primary font-bold mb-4">Resources</h3>
						<ul className="space-y-2">
							<li><a href="#" className="text-gray-500 hover:text-some-less text-sm">Documentation</a></li>
						</ul>
					</div>
					<div>
						<h3 className="text-primary font-bold mb-4">Legal</h3>
						<ul className="space-y-2">
							<li>
								<a href="/legal/privacy" className="text-gray-500 hover:text-some-less text-sm">
									Privacy Policy
								</a>
							</li>
							<li>
								<a href="/legal/terms-of-use" className="text-gray-500 hover:text-some-less text-sm">
									Terms of Service
								</a>
							</li>
						</ul>
					</div>
				</div>
				<div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
					<div className="flex items-center gap-2">
						<TitleWithLogo useSvg />
						<span className="text-less text-sm">© 2025 Lynfera Inc. All rights reserved.</span>
					</div>
					<div className="flex gap-6">
						<Button title="View Our Repo" variant={"ghost"}
							className="text-gray-500 hover:text-primary border border-transparent hover:border-neutral-500">
							<LuGithub className=" cursor-pointer" size={20} />
						</Button>
						<ThemeSwitcher className="rounded-full" />
					</div>
				</div>
			</div>
		</footer>
	);
};
