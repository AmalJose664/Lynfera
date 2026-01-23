import StartsAsk from "@/components/docs/StarAsk";
import { SITE_NAME } from "@/config/constants";
import Link from "next/link";

const menuItems = [
	{ url: 'getting-started', label: 'Getting Started' },
	{ url: 'support-and-limits', label: 'Supported Frameworks' },
	{ url: 'build-deploy', label: 'Build & Deploy' },
	{ url: 'env-variables', label: 'Environment Variables' },
	{ url: 'troubleshoot', label: 'Common Errors / Logs' },
];
export default function layout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="min-h-screen text-primary antialiased">
			<div className="max-w-[1380px] mx-auto px-4 pt-12">
				<header className="mb-12">
					<h1 className="text-2xl font-bold tracking-tight">Minimal Documentation {SITE_NAME}</h1>
				</header>

				<div className="flex flex-col md:flex-row gap-16 md:gap-0">
					<aside className="md:w-60 flex-shrink-0">
						<nav className="sticky top-12">
							<ul className="space-y-2">
								{menuItems.map((item) => (
									<li key={item.url} className="border border-transparent dark:hover:border-neutral-700 hover:border-neutral-300 mr-4 rounded-md">
										<Link
											href={`/docs/${item.url}`}
											className="block px-4 py-2 text-sm font-medium text-some-less hover:text-primary hover:no-underline rounded-lg transition-colors"
										>
											{item.label}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					</aside>
					{children}

				</div>
			</div>
			<StartsAsk />
		</div>
	)
}