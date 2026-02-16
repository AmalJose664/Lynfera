import EachLink from "@/components/docs/EachLink";
import StarsAsk from "@/components/docs/StarAsk";
import { SITE_NAME } from "@/config/constants";

const menuItems = [
	{ url: 'getting-started', label: 'Getting Started' },
	{ url: 'support-and-limits', label: 'Supported Frameworks' },
	{ url: 'build-deploy', label: 'Build & Deploy' },
	{ url: 'env-variables', label: 'Environment Variables' },
	{ url: 'observability', label: 'Logs and Analytics' },
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
									<EachLink key={item.url} item={item} />
								))}
							</ul>
						</nav>
					</aside>
					{children}

				</div>
			</div>
			<StarsAsk />
		</div>
	)
}