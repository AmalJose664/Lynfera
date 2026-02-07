import { CodeComponent, LinkComponent } from "@/components/docs/HelperComponents"
import { SITE_NAME } from "@/config/constants"

export const metadata = {
	title: "Environment Variables | " + SITE_NAME,
	description:
		"How to define, manage, and use environment variables during build and deployment.",
};



const page = () => {
	return (
		<main className="px-4 space-y-16">
			<div className="w-full border-b pb-2">
				<h2 className="text-4xl">Enviroment Variables</h2>
			</div>
			<section id="env-varibles" className="space-y-12">
				<section id="env-intro" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Environment variables</h2>
								<p className="text-sm mt-4 text-primary ">Environment variables are key-value pairs configured outside your source code so that each value can change depending on the Environment. </p>
								<p className="text-sm mt-4 text-primary ">Your source code can read these values to change behavior during the <LinkComponent href="/docs/build-deploy/#build-infra" >Build Step</LinkComponent> or during Function execution.</p>
								<p className="text-sm mt-4 text-primary ">Any change you make to environment variables are not applied to previous deployments, they only apply to new deployments.</p>
							</div>
						</div>
					</div>
				</section>
				<section id="env-create" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Creating environment variables</h2>
								<p className="text-sm mt-4 text-primary ">Environment variables can be declared only at the project level.</p>
							</div>
						</div>
					</div>
				</section>
				<section id="env-declare" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Declare an Environment Variable</h2>
								<p className="text-sm mt-4 text-primary ">To declare an Environment Variable for your deployment:</p>
							</div>
							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li>From your <LinkComponent href="/projects">dashboard</LinkComponent>, select your project.</li>
								<li>Select the<strong> Settings </strong> tab.</li>
								<li>Go to the <strong>Environment Variables</strong> section of your <strong>Project Settings</strong>.</li>
								<li>Enter the desired <strong>Name</strong> for your Environment Variable. For example, if you are using React and you create an Environment Variable named <CodeComponent>REACT_APP_API_URL</CodeComponent>, it will be available under <CodeComponent>process.env.REACT_APP_API_URL</CodeComponent> in your code.</li>
								<li>Then, enter the <strong>Value</strong> for your Environment Variable.</li>
								<li>Click Save and Deploy or just Save.</li>
								<li>You can also add Environment Variable at project creation.</li>
							</ul>
						</div>
					</div>
				</section>
				<section id="env-prefixes" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Framework Prefixes</h2>
								<p className="text-sm mt-4 text-primary ">Most modern frameworks only expose variables to the browser if they have a specific prefix. Ensure your keys follow your framework's rules:</p>
							</div>
							<ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono px-3 py-1 space-y-3 mt-3">
								<li className="p-2 bg-secondary rounded border">Vite: <span className="text-primary">VITE_API_URL</span></li>
								<li className="p-2 bg-secondary rounded border">React (CRA): <span className="text-primary">REACT_APP_API_URL</span></li>
								<li className="p-2 bg-secondary rounded border">Vue CLI: <span className="text-primary">VUE_APP_API_URL</span></li>
								<li className="p-2 bg-secondary rounded border">SvelteKit: <span className="text-primary">PUBLIC_API_URL</span></li>
							</ul>
						</div>
					</div>
				</section>


				<section id="env-security" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Security Warning</h2>
								<p className="text-sm mt-4 text-primary"> {SITE_NAME} does not encrypt environment variables, since anything exposed to the frontend can be accessed by anyone.</p>
								<p className="text-sm mt-4 text-primary ">Never store sensitive secrets (like private Database Passwords or Secret API Keys) in Lynfera environment variables. Because these are bundled into the frontend, <strong>anyone can view them</strong> by inspecting your site's source code in the browser.</p>
							</div>
						</div>
					</div>
				</section>

				<section className="border px-4 py-2 rounded-md dark:bg-neutral-900 bg-white p-4">
					<h2 className="mb-6 text-2xl font-bold tracking-tight text-primary">
						User-Configurable Environment Variables
					</h2>
					<p className="mb-6 text-less">
						{SITE_NAME} allows you to define environment variables that customize how your code is built and deployed.
					</p>
					<p className="mb-6 text-less">
						These variables are injected into the build container at build time and can be used to control build behavior, feature flags, or environment-specific settings.
					</p>
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-less border rounded-lg">
							<thead className="bg-secondary/30">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-bold uppercase text-primary">Variable</th>
									<th className="px-6 py-3 text-left text-xs font-bold uppercase text-primary">Value / Purpose</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-less text-sm">
								<tr>
									<td className="px-6 py-4 font-mono text-primary">LYNFERA_SETTING_SKIP_INSTALL</td>
									<td className="px-6 py-4 text-less">
										Set to <CodeComponent>true</CodeComponent> to skip the dependency installation step. Useful when deploying prebuilt assets or static files that don’t require package installation.
									</td>
								</tr>

								<tr>
									<td className="px-6 py-4 font-mono text-primary">LYNFERA_SETTING_SKIP_BUILD</td>
									<td className="px-6 py-4 text-less">
										Set to <CodeComponent>true</CodeComponent> to skip the build step. When combined with <CodeComponent>SKIP_INSTALL</CodeComponent>, Lynfera directly uploads the provided files without running any build commands.
									</td>
								</tr>

								<tr>
									<td className="px-6 py-4 font-mono text-primary">LYNFERA_SETTING_SKIP_DECOR_LOGS</td>
									<td className="px-6 py-4 text-less">
										Set to <CodeComponent>true</CodeComponent> to disable decorative or non-essential logs, producing cleaner and more minimal build output.
									</td>
								</tr>

								<tr>
									<td className="px-6 py-4 font-mono text-primary">LYNFERA_SETTING_INSTALL_RETRIES</td>
									<td className="px-6 py-4 text-less">
										Number of times dependency installation should be retried on failure. Defaults to <CodeComponent>3</CodeComponent>. Each retry uses more permissive flags (such as legacy or force options) to improve install reliability.
									</td>
								</tr>

								<tr>
									<td className="px-6 py-4 font-mono text-primary">LYNFERA_SETTING_FRAMEWORK</td>
									<td className="px-6 py-4 text-less">
										Manually specify the framework for the project. Overrides automatic framework detection and allows Lynfera to apply the correct build configuration earlier in the process.
									</td>
								</tr>

								<tr>
									<td className="px-6 py-4 font-mono text-primary">LYNFERA_PREVENT_DEPLOYMENT_AUTO_PROMOTION</td>
									<td className="px-6 py-4 text-less">
										Set to <CodeComponent>true</CodeComponent> to disable automatic promotion of a successful deployment. This allows manual review or staged releases before making the deployment live.
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>


				<section className="border px-4 py-2 rounded-md dark:bg-neutral-900 bg-white p-4">
					<h2 className="mb-6 text-2xl font-bold tracking-tight text-primary">
						System Environment Variables
					</h2>
					<p className="mb-6 text-less">
						{SITE_NAME} automatically injects these variables into every build container. You can use them to customize your app based on the deployment environment.
					</p>

					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-less border rounded-lg">
							<thead className="bg-secondary/30">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-bold uppercase text-primary">Variable</th>
									<th className="px-6 py-3 text-left text-xs font-bold uppercase text-primary">Value / Purpose</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-less text-sm">
								<tr>
									<td className="px-6 py-4 font-mono text-primary">CI</td>
									<td className="px-6 py-4 text-less">Set to <CodeComponent>true</CodeComponent> to prevent interactive prompts during build.</td>
								</tr>
								<tr>
									<td className="px-6 py-4 font-mono text-primary">NODE_ENV</td>
									<td className="px-6 py-4 text-less">Always set to <CodeComponent>production</CodeComponent>.</td>
								</tr>

								<tr>
									<td className="px-6 py-4 font-mono text-primary">{SITE_NAME.toUpperCase() + "_BUILD_ID"}</td>
									<td className="px-6 py-4 text-less">Build / Deployment Id.</td>
								</tr>
								<tr>
									<td className="px-6 py-4 font-mono text-primary">{SITE_NAME.toUpperCase() + "_GIT_COMMIT_SHA"}</td>
									<td className="px-6 py-4 text-less">Git commit hash value.</td>
								</tr>
								<tr>
									<td className="px-6 py-4 font-mono text-primary">{SITE_NAME.toUpperCase() + "_GIT_BRANCH"}</td>
									<td className="px-6 py-4 text-less">Git branch from which code deployed.</td>
								</tr>

								<tr>
									<td className="px-6 py-4 font-mono text-primary">{SITE_NAME.toUpperCase() + "_PUBLIC_ID"}</td>
									<td className="px-6 py-4 text-less">Public Id of each Deployment.</td>
								</tr>
								<tr>
									<td className="px-6 py-4 font-mono text-primary">{SITE_NAME.toUpperCase() + "_PROJECT_ID"}</td>
									<td className="px-6 py-4 text-less">Project Id.</td>
								</tr>
								<tr>
									<td className="px-6 py-4 font-mono text-primary">{SITE_NAME.toUpperCase() + "_PROJECT_URL"}</td>
									<td className="px-6 py-4 text-less">Project accesible url. Requires new deployment when subdomain changes</td>
								</tr>

								<tr>
									<td className="px-6 py-4 font-mono text-primary">{SITE_NAME.toUpperCase() + "_DEPLOYMENT_URL"}</td>
									<td className="px-6 py-4 text-less">Project and specific deployment access url. Can change when subdomain changes</td>
								</tr>
								<tr>
									<td className="px-6 py-4 font-mono text-primary">NODE_VERSION</td>
									<td className="px-6 py-4 text-less">Default Value 22</td>
								</tr>
							</tbody>
						</table>
					</div>
				</section>
			</section>
		</main>
	)

}
export default page

