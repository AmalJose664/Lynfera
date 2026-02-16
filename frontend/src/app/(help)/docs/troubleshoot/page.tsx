import { CodeComponent, LinkComponent } from "@/components/docs/HelperComponents"
import { SITE_NAME } from "@/config/constants"


export const metadata = {
	title: "Troubleshooting | " + SITE_NAME,
	description:
		"Common deployment errors, build failures, and logs with explanations and fixes.",
};


const page = () => {
	return (
		<main className="px-4 space-y-16">
			<div className="w-full border-b pb-2">
				<h2 className="text-4xl">Troubleshooting, Logs and FAQs</h2>
				<p className="text-base mt-4 leading-8 text-less">
					Solutions for common build failures, deployment quirks, and environment issues.
				</p>
			</div>
			<section id="troubleshoot-build" className="space-y-12">
				<div>
					<h2 className="text-2xl">Troubleshooting Build Errors</h2>
					<p className="text-base mt-4 leading-8 text-less">
						You can troubleshoot build errors that occur during the Build step of your deployment to {SITE_NAME}. This guide will help you understand how to investigate build failures and long build times.
					</p>
				</div>
				<section id="troubleshoot-build-views" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
				bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-xl font-semibold">Troubleshooting views</h2>
							<p className="text-sm text-primary mt-4">You can use the following views on your dashboard to troubleshoot a build:</p>
							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li><strong>Build logs </strong>- the console output when your deployment is building which can be found under the Deployment Status section of the Project's Deployment page.</li>
							</ul>
						</div>
					</div>
				</section>
				<section id="troubleshoot-build-failures" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
				bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-xl font-semibold">Troubleshoot Build failures</h2>
							<p className="text-sm text-primary mt-4">If your build fails, {SITE_NAME} will report the error message on the Deployments page so that you can investigate and fix the underlying issue.</p>
							<ul className="px-3 py-1 list-decimal space-y-3 mt-3">
								<li><strong>Build logs </strong>- From your {SITE_NAME} dashboard, select the project then view the deployments tab or at the <LinkComponent href="/deployments">Deployments</LinkComponent>.</li>
								<li>Select the deployment. When there are build issues you will notice an error status next to deployment name</li>
								<li>On the errored deployment's page, you will see a summary of the error.</li>
							</ul>
							<div className="pt-3 border-t border-neutral-500 mt-6">
								<p className="text-sm text-primary mt-4">You can also view the logs from the build  logs button from each deployment's or project's page.</p>
							</div>
							<div>
								<p className="text-sm text-primary mt-4">It is recommended to build your project on your local machine first (the build command varies per project) before deploying on {SITE_NAME}. This will catch issues specific to your code or to your project's dependencies.</p>
							</div>
						</div>
					</div>
				</section>
				<section id="troubleshoot-build-notstart" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
				bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-xl font-semibold">Build Logs not available</h2>
							<p className="text-sm text-primary mt-4">Builds can fail without providing any build logs when {SITE_NAME} detects a missing precondition that prevents a build from starting. Main reasons are:</p>
							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li>It can be error on our own side.</li>
								<li>Build process failed to start itself.</li>
								<li>Network problems.</li>
								<li>when using invalid Build Steps.</li>
								<li>Logs got removed <LinkComponent href="/docs/observability#logs-retention">Learn more</LinkComponent></li>
							</ul>
						</div>
					</div>
				</section>

				<section id="troubleshoot-logs" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
				bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-lg">Troubleshooting Errors with Logs</h2>
							<LinkComponent href="/docs/observability/#logs-working">View Logs details</LinkComponent>
						</div>
					</div>
				</section>
			</section>
			<div>
				<h2 className="text-4xl">Other Troubleshoots</h2>
			</div>
			<section id="troubleshoot-others-no-output" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
				bg-white ">
				<div className="px-4 py-4">
					<h3 className="text-lg font-semibold text-primary">Output Directory Mismatch</h3>
					<p className="text-less text-sm">
						If your build "succeeds" but your site is blank or shows a 404, verify your <strong>Output Directory</strong>.
					</p>
					<div className="mt-3 grid grid-cols-2 gap-4 text-xs font-mono">
						<div className="p-2 bg-secondary rounded border">Vite: <span className="text-primary">dist</span></div>
						<div className="p-2 bg-secondary rounded border">React (CRA): <span className="text-primary">build</span></div>
						<div className="p-2 bg-secondary rounded border">Next (Static): <span className="text-primary">out</span></div>
						<div className="p-2 bg-secondary rounded border">Vue/Angular: <span className="text-primary">dist</span></div>
					</div>
				</div>
			</section>
			<section id="troubleshoot-others-routing-1" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
				bg-white ">
				<div className="px-4 py-4">
					<h2 className="mb-4 text-2xl font-bold tracking-tight text-primary">Routing & 404 Errors</h2>
					<p className="text-sm text-less leading-relaxed">
						In Single Page Applications (React, Vue, Vite), the browser handles routing. If a user refreshes <code>myapp.com/dashboard</code>, the server looks for a file that doesn't exist.
					</p>
					<p className="text-sm text-less mt-2 font-medium">
						<strong>The Fix:</strong> Go to Project Settings and enable <span className="text-primary font-bold">"Force non-file paths to root path"</span>. This tells Lynfera to serve your <code>index.html</code> for all virtual routes.
					</p>
				</div>
			</section>
			<section id="troubleshoot-others-routing-2" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
				bg-white ">
				<div className="px-4 py-4">
					<h2 className="mb-4 text-2xl font-bold tracking-tight text-primary">
						DNS / Hostname Resolution Errors
					</h2>
					<p className="text-sm text-less leading-relaxed">
						These errors are rare and usually occur when a specific subdomain cannot be
						resolved or is rejected by the hosting provider. Although they may appear as
						DNS failures in the browser, they are often caused by hostname routing,
						SSL, or connection issues rather than DNS itself.
					</p>
					<p className="text-sm text-less leading-relaxed mt-2">
						You may see errors such as:
					</p>
					<ul className="px-3 py-1 list-disc space-y-3 mt-3">
						<li><CodeComponent>ERR_NAME_NOT_RESOLVED</CodeComponent></li>
						<li><CodeComponent>ERR_CONNECTION_RESET</CodeComponent></li>
						<li><CodeComponent>ERR_SSL_PROTOCOL_ERROR</CodeComponent></li>
					</ul>
					<p className="text-sm text-less mt-3">
						These typically happen when a subdomain is temporarily unavailable,
						blocked, not yet propagated, or not recognized by the hosting platform.
					</p>
					<p className="text-sm text-less mt-2 font-medium">
						<strong>Fix:</strong> Try changing your project subdomain or creating a new
						one. Using a slightly different name usually resolves the issue immediately.
						If the problem persists, wait a few minutes for DNS propagation and try again.
					</p>
				</div>
			</section>

		</main>
	)

}
export default page

