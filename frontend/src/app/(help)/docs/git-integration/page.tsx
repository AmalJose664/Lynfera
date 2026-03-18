import { CodeComponent, LinkComponent } from "@/components/docs/HelperComponents";
import { githubAppLink, SITE_NAME } from "@/config/constants";
import { ProjectStatus } from "@/types/Project";

export const metadata = {
	title: "Git Integrations | " + SITE_NAME,
	description:
		"Overview for how to use GitHub to deploy projects.",
};


const page = () => {

	return (
		<main className="  px-4 space-y-16">
			<div className="w-full border-b pb-2">
				<h2 className="text-4xl">Git Integrations</h2>
			</div>
			<section id="github-git-integration" className="space-y-12">
				<div>
					<div className="flex gap-3 items-center">
						<h2>GitHub</h2>
						<LinkComponent href={githubAppLink}>View App</LinkComponent>
					</div>
					<p className="mt-4">{SITE_NAME} automatically performs a build every time you push code to GitHub.</p>

				</div>

				<section id="github-gi-supports" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
						bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-xl font-semibold">Supported GitHub Products</h2>
							<p className="text-sm text-primary mt-4">
								{SITE_NAME} supports both personal GitHub accounts and organizations. While organization integrations are supported, some configurations may require additional setup and could have limitations.
							</p>
							<p className="text-sm text-primary mt-4">{SITE_NAME} currently allows git support for: </p>
							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li><LinkComponent href="https://github.com/pricing" newPage>GitHub Free</LinkComponent></li>
							</ul>
						</div>
					</div>
				</section>

				<section id="github-gi-deploy" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
						bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-xl font-semibold">Deploying a GitHub repository</h2>
							<p className="text-sm text-primary mt-4">Setting up your GitHub repository on {SITE_NAME} is as simple as clicking the <LinkComponent href="/new?tab=provider">New Project</LinkComponent> button on the top right of your dashboard.</p>

							<p className="text-sm text-primary mt-4">After clicking, if your GitHub repository doesn't appear, you'll see a <strong>Connect</strong> button to link your account. Otherwise, a list of Git repositories your account has read access to will be displayed.</p>

							<p className="text-sm text-primary mt-4">If your GitHub repository still doesn't show up, you can configure it through the {SITE_NAME} GitHub App by using the <strong>Configure</strong> link on the <LinkComponent href="/new?tab=provider">/new</LinkComponent> page and selecting the repositories via the GitHub UI.</p>
						</div>
					</div>
				</section>
				<section id="github-gi-private" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
						bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-xl font-semibold">Deploying private Git repositories</h2>

							<p className="text-sm text-primary mt-4">You can deploy private GitHub repositories as long as you've granted access to them via the GitHub UI for the {SITE_NAME} GitHub App.</p>
						</div>
					</div>
				</section>
				<section id="github-gi-permissions" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
						bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-xl font-semibold">{SITE_NAME} GitHub App permissions</h2>

							<p className="text-sm text-primary mt-4">{SITE_NAME} GitHub App only requires the following permissions:</p>
							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li>Read access to code and metadata</li>
							</ul>
						</div>
					</div>
				</section>

				<section id="github-gi-behaviour" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
						bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-xl font-semibold">Deploy Behaviour</h2>

							<p className="text-sm text-primary mt-4">{SITE_NAME} starts a new deploy as soon as you push to your repositories. But triggering a new deploy comes with some conditions.</p>
							<p className="text-sm text-primary mt-4">{SITE_NAME} only starts a new deploy only if :</p>
							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li>
									<strong>Directory Match:</strong> Changes occur within the defined <CodeComponent>Project.RootDir</CodeComponent>.
								</li>
								<li>
									<strong>Global Threshold:</strong> If the total number of changes (modifications/deletions) across the entire repository exceeds <CodeComponent>100</CodeComponent>, a deploy is triggered regardless of the directory.
								</li>
								<li>
									<strong>Active Status:</strong> The project is not in a <CodeComponent>disabled</CodeComponent> state.
								</li>
								<li>
									<strong>Branch Match:</strong> The push occurs on the project's configured <CodeComponent>Branch</CodeComponent>.
								</li>
								<li>
									<strong>Setting Enabled:</strong> <CodeComponent>AutoDeployEnabled</CodeComponent> is set to true in your settings.
								</li>
							</ul>
						</div>
					</div>
				</section>
				<section id="github-gi-monorepo" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="px-4 py-4">
						<h2 className="text-xl font-semibold">Monorepo & Root Directory</h2>
						<p className="text-sm text-primary mt-4">
							If your GitHub repository contains multiple projects, you can specify which folder to deploy using the <CodeComponent>Project.RootDir</CodeComponent> setting in your project configuration.
						</p>
						<p className="text-sm text-primary mt-4">
							By default, {SITE_NAME} only triggers a build if changes are detected within the specified Root Directory. Changes made to files outside of this directory (such as documentation or other sub-projects) will be ignored unless they meet the global change threshold.
						</p>
					</div>
				</section>
				<section id="github-gi-override" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
						bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-xl font-semibold">Deploy Controls</h2>

							<p className="text-sm text-primary mt-4">By default {SITE_NAME} starts a new deploy only starts a new deploy if the above conditions are met.</p>
							<p className="text-sm text-primary mt-4">But you can override those by setting keywords in your last commit.</p>

							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li><p className="text-sm text-primary mt-4"><strong>Force Deploy:</strong> Include the string <CodeComponent>'[force-deploy]'</CodeComponent> to trigger a new deploy. This will override all file-based and change-based checks..</p></li>
								<li><p className="text-sm text-primary mt-4"><strong>Skip Deploy:</strong> Include the string <CodeComponent>'[skip-ci]'</CodeComponent> to skip a new deploy. This will skip the deploy.</p></li>
							</ul>
							<p className="text-sm text-primary mt-4">Make sure to include these keywords in the last commit you are pushing; otherwise, they will be ignored.</p>
						</div>
					</div>
				</section>

				<section id="github-gi-logs-track" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="px-4 py-4">
						<h2 className="text-xl font-semibold">Tracking Deployment Progress</h2>
						<p className="text-sm text-primary mt-4">
							{SITE_NAME} does not write data back to GitHub, build status icons (checkmarks or crosses) will not appear in your commit history.
						</p>
						<p className="text-sm text-primary mt-4">
							To monitor your build, check the <strong>Deployments</strong> tab within your {SITE_NAME} dashboard. Every push that meets the deployment criteria will generate a new log entry there.
						</p>
					</div>
				</section>
				<section id="github-gi-submodules" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="px-4 py-4">
						<h2 className="text-xl font-semibold">Git Submodules</h2>
						<p className="text-sm text-primary mt-4">
							{SITE_NAME} <strong>does not</strong> support Git submodules.
						</p>
						<p className="text-sm text-primary mt-4">
							When your repository is cloned for deployment, submodules will not be initialized or pulled. Ensure all necessary code and dependencies are contained within the main repository.
						</p>
					</div>
				</section>
				<section id="github-gi-failures" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="px-4 py-4">
						<h2 className="text-xl font-semibold">Handling Deployment Failures</h2>

						<p className="text-sm text-primary mt-4">
							Sometimes, deployments may fail due to various reasons such as:
						</p>
						<ul className="px-3 py-1 list-disc space-y-3 mt-3 text-sm text-primary">
							<li>Limited runners available for processing the build.</li>
							<li>The maximum number of concurrent builds has been reached.</li>
							<li>Maximum concurrent builds per user have been exceeded.</li>
							<li>The project is currently in a <CodeComponent>{ProjectStatus.QUEUED}</CodeComponent> or <CodeComponent>{ProjectStatus.BUILDING}</CodeComponent> state.</li>
							<li>The user has reached their daily deployment limit.</li>
							<li>Internal server errors or unexpected issues.</li>
						</ul>

						<p className="text-sm text-primary mt-4">
							In any of these cases, a **failed deployment** will be created when a webhook request is received. This ensures that you are notified that a deployment was attempted but could not run due to the above limits or errors.
						</p>

						<p className="text-sm text-primary mt-4">
							<strong>Important:</strong> No changes will be made to the project itself—the current state of your project remains unchanged. The failed deployment serves purely as a notification.
						</p>
					</div>
				</section>
				<section id="github-gi-reconnect-transfer" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="px-4 py-4">
						<h2 className="text-xl font-semibold">Fixing Connection Issues / Transfers</h2>
						<p className="text-sm text-primary mt-4">
							If you rename your repository or transfer it, the webhook connection may fail. To reset the connection:
						</p>
						<ol className="px-3 py-1 list-disc space-y-3 mt-3 text-sm text-primary">
							<li>Visit your GitHub <LinkComponent href="https://github.com/settings/installations" newPage>Applications Settings</LinkComponent>.</li>
							<li>Find the {SITE_NAME} GitHub App and remove its access to the specific repository or uninstall it.</li>
							<li>Return to the {SITE_NAME} dashboard and reconnect the repository to establish a fresh webhook.</li>
						</ol>
					</div>
				</section>
				<section id="github-gi-remove" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
						bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-xl font-semibold">Removing GitHub App</h2>

							<p className="text-sm text-primary mt-4">You can remove the GitHub App by visiting the <LinkComponent href="/users#github">Users</LinkComponent> page and just clicking the remove button.</p>

							<h2 className="text-base mt-4 font-semibold">Important</h2>
							<p className="text-sm text-primary mt-4">Removing the GitHub App will set all your connected projects to a <CodeComponent>Disconnected</CodeComponent> state.</p>
							<p className="text-sm text-primary mt-4">You can reconnect by linking your account again and granting repository access.</p>
							<p className="text-sm text-primary mt-4">Removing GitHub connection from {SITE_NAME} will also cause it to remove it from your GitHub installations list at <LinkComponent href="https://github.com/settings/installations">installations</LinkComponent>.</p>
						</div>
					</div>
				</section>
			</section>
		</main >
	)
}
export default page
