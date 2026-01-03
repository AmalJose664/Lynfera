import { SITE_NAME } from "@/config/constants";
import Link from "next/link";

export const metadata = {
	title: "Documentation | " + SITE_NAME,
	description:
		"Technical specifications and guidelines for deploying static applications.",
};

const Page = () => {
	return (
		<div className="min-h-screen text-primary antialiased">
			<DocsPage />
		</div>
	);
};

function DocsPage() {
	return (
		<article className="mx-auto max-w-7xl px-6 py-12 mt-2 rounded-md">

			<header className="mb-16 border-b pb-10 dark:bg-neutral-900 bg-white p-4 rounded-md">
				<span className="mb-4 block text-sm font-semibold uppercase tracking-wider text-less">
					Technical Documentation
				</span>
				<h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl">
					Deployment Specifications
				</h1>
				<p className="text-xl leading-8 text-less">
					A guide to the supported environments, limitations, and best practices for deploying applications to the edge network.
				</p>
			</header>

			<div className="space-y-16 border px-8 py-4 rounded-md">

				<section className="border px-4 py-2 rounded-md dark:bg-neutral-900 bg-white p-4 ">
					<h2 className="mb-6 text-2xl font-bold tracking-tight text-primary">
						1. Getting Started
					</h2>
					<p className="mb-4 text-lg leading-8 text-less">
						This platform is strictly engineered for frontend-only projects. It abstracts away the complexity of server management, allowing developers to focus on building user interfaces.
					</p>
					<p className="text-lg leading-8 text-less">
						To begin, prepare your React build or static assets. The deployment pipeline will automatically detect your configuration, optimize assets, and distribute them to the global edge network.
					</p>
				</section>

				<section className="border px-4 py-2 rounded-md dark:bg-neutral-900 bg-white p-4 ">
					<h2 className="mb-6 text-2xl font-bold tracking-tight text-primary">
						2. Supported Environments
					</h2>
					<div className="rounded-lg border overflow-hidden">
						<table className="min-w-full divide-y divide-less">
							<tbody className="divide-y divide-less bg-background">
								<tr className="hover:bg-secondary transition-colors">
									<td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-primary">Frameworks</td>
									<td className="px-6 py-4 text-sm text-less">React, Vue, Svelte, Angular, Preact</td>
								</tr>
								<tr className="hover:bg-secondary transition-colors">
									<td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-primary">Architecture</td>
									<td className="px-6 py-4 text-sm text-less">Single Page Applications (SPA), Static Sites (SSG)</td>
								</tr>
								<tr className="hover:bg-secondary transition-colors">
									<td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-primary">Assets</td>
									<td className="px-6 py-4 text-sm text-less">HTML, CSS, JavaScript, Images, Fonts, JSON</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>

				<section className="border px-4 py-2 rounded-md dark:bg-neutral-900 bg-white p-4 ">
					<h2 className="mb-6 text-2xl font-bold tracking-tight text-primary">
						3. Platform Limitations
					</h2>
					<div className="bg-background px-8 py-6 rounded-lg border border-l-4">
						<p className="mb-4 font-medium text-primary">
							The platform intentionally excludes server-side capabilities to maximize edge performance.
						</p>
						<ul className="list-disc space-y-2 pl-5 text-less">
							<li>No backend runtimes (Node.js, Python, PHP, etc.)</li>
							<li>No serverless function execution</li>
							<li>No integrated SQL or NoSQL databases</li>
							<li>No background cron jobs or workers</li>
						</ul>
					</div>
				</section>

				<section className="border px-4 py-2 rounded-md dark:bg-neutral-900 bg-white p-4 ">
					<h2 className="mb-6 text-2xl font-bold tracking-tight text-primary">
						4. Recommended Use Cases
					</h2>
					<div className="grid gap-8 sm:grid-cols-2">
						<div>
							<h3 className="font-semibold text-primary">Web Applications</h3>
							<p className="mt-2 text-less leading-relaxed">
								Ideal for dashboards, SaaS tools, and client-side apps that consume external APIs for data.
							</p>
						</div>
						<div>
							<h3 className="font-semibold text-primary">Static Content</h3>
							<p className="mt-2 text-less leading-relaxed">
								Perfect for documentation sites, marketing landing pages, and portfolios where speed is critical.
							</p>
						</div>
					</div>
				</section>
				<section className="border px-4 py-2 rounded-md dark:bg-neutral-900 bg-white">
					<div className="mb-4">
						<h2 className="mb-2 text-base font-bold tracking-tight text-primary">
							Node Version
						</h2>
						<div className="grid gap-8 sm:grid-cols-2">
							<p className="text-less leading-relaxed">
								v22.21.1
							</p>
						</div>
					</div>
					<div className="mb-4">

						<h2 className="mb-2 text-base font-bold tracking-tight text-primary">
							Build Container
						</h2>
						<div className="flex items-center gap-5">
							<p className="text-less leading-relaxed">
								amal664/lynfera-builds
							</p>
							<Link target="_blank" href={'https://hub.docker.com/r/amal664/lynfera-builds'}
								className="underline text-less leading-relaxed">
								View Container
							</Link>
						</div>
					</div>
				</section>

			</div>
		</article>
	);
}

export default Page;