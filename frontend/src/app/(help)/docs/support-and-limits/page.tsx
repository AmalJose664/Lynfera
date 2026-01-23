import { LinkComponent } from "@/components/docs/HelperComponents";
const page = () => {

	return (
		<main className="space-y-12  px-4">
			<div className="w-full border-b pb-2">
				<h2 className="text-4xl">Support and Limits</h2>
			</div>
			<article className="mx-auto max-w-7xl px-6 rounded-md">
				<header className="mb-16 border-b pb-10 scroll-mt-12 border rounded-md overflow-hidden dark:bg-background bg-white  p-4">
					<h1 className="mb-6 text-xl font-bold leading-tight tracking-tight text-primary sm:text-xl">
						Supported Frameworks & Specs
					</h1>
					<p className="text-base leading-8 text-less">
						Lynfera is optimized for Single Page Applications (SPA) and Static Site Generators (SSG).
						If your project outputs standard web assets, we can host it.
					</p>
				</header>

				<div className="space-y-16">
					<section className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-background bg-white  px-4 py-2  p-4">
						<h2 className="mb-6 text-2xl font-bold tracking-tight text-primary">
							Supported Environments
						</h2>
						<div className="rounded-lg border overflow-hidden">
							<table className="min-w-full divide-y divide-less rounded-md dark:bg-neutral-900 bg-white">
								<tbody className="divide-y divide-less ">
									<tr className="hover:bg-secondary transition-colors">
										<td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-primary">Frameworks</td>
										<td className="px-6 py-4 text-sm text-less">React, Vue, Svelte, Angular, Preact, Vite-based apps</td>
									</tr>
									<tr className="hover:bg-secondary transition-colors">
										<td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-primary">Architecture</td>
										<td className="px-6 py-4 text-sm text-less">SPAs and Static Sites (SSG)</td>
									</tr>
									<tr className="hover:bg-secondary transition-colors">
										<td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-primary">Output</td>
										<td className="px-6 py-4 text-sm text-less">Static HTML, CSS, JS, Images, JSON, Fonts</td>
									</tr>
								</tbody>
							</table>
						</div>
						<p className="mt-4 text-sm text-less italic">
							Note: You can override the default **Build Command** and **Output Directory** in the "Advanced Settings" during project creation.
						</p>
					</section>

					<section className="border px-4 py-2 rounded-md dark:bg-background bg-white p-4 ">
						<h2 className="mb-6 text-2xl font-bold tracking-tight text-primary">
							3. Platform Limitations
						</h2>
						<div className="dark:bg-neutral-900 bg-white px-8 py-6 rounded-lg border border-l-4">
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

					<section className="border px-4 py-2 rounded-md dark:bg-neutral-900 bg-white p-4">
						<h2 className="mb-6 text-2xl font-bold tracking-tight text-primary">
							Build Environment Details
						</h2>
						<div className="grid gap-8 sm:grid-cols-2">
							<div>
								<h3 className="text-sm font-bold uppercase text-less">Node Version</h3>
								<p className="mt-1 text-primary font-mono bg-secondary px-2 py-1 rounded inline-block">
									v22.21.1
								</p>
							</div>
							<div>
								<h3 className="text-sm font-bold uppercase text-less">Build Container</h3>
								<div className="flex items-center gap-3 mt-1">
									<p className="text-primary font-mono text-sm">amal664/lynfera-builds</p>
									<LinkComponent newPage href="https://hub.docker.com/r/amal664/lynfera-builds" className="text-sm">
										View Image
									</LinkComponent>
								</div>
							</div>
						</div>
					</section>
				</div>
			</article>
		</main>
	)
}
export default page
