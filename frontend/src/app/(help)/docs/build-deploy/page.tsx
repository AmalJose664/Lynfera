import { CodeComponent, LinkComponent } from "@/components/docs/HelperComponents"
import { SITE_NAME } from "@/config/constants"



export const metadata = {
	title: "Build & Deploy | " + SITE_NAME,
	description:
		"Instructions and best practices for building and deploying static applications efficiently.",
};




const page = () => {
	return (
		<main className="  px-4 space-y-16">
			<div className="w-full border-b pb-2">
				<h2 className="text-4xl">Build and Deploys</h2>
			</div>
			<section id="build" className="space-y-12">
				<div>
					<h2>Builds</h2>
					<p className="mt-4">{SITE_NAME} automatically performs a build every time you start a deployment in the UI</p>
				</div>

				<section id="build-infra" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
				bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-xl font-semibold">Build infrastructure</h2>
							<p className="text-sm text-primary mt-4">When you initiate a build, {SITE_NAME} creates a secure, isolated virtual environment for your project:</p>
							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li>Your code is built in a consistent, clean environment</li>
								<li>Build processes can't interfere with other users' applications</li>
								<li>Security is maintained through complete isolation</li>
							</ul>
						</div>
					</div>
				</section>
				<section id="build-trigger" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-xl font-semibold">How builds are triggered</h2>
							<p className="text-sm text-primary mt-4">Builds can be initiated in the following ways:</p>
							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li><strong>Dashboard deploy:</strong> Clicking Deploy in the dashboard or creating a new project triggers a build.</li>
								<li><strong>Git push:</strong> Coming soon</li>
							</ul>
						</div>
					</div>
				</section>
				<section id="build-customize" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-xl font-semibold">Build customization</h2>
							<p className="text-sm text-primary mt-4">Commands like build command and the install command are initially set by {SITE_NAME}. You can override them depending on your framework in the <LinkComponent href="/projects/">project settings tab</LinkComponent> or while creating a new project.</p>
							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li><strong>Build Command:</strong> Default build command (npm run build).</li>
								<li><strong>Install Command:</strong> Default install command is npm install.</li>
								<li><strong>Output Directory:</strong> Specify the folder containing your final build output (e.g., dist or build).</li>
								<li><strong>Root Directory:</strong> Path Where your code is in your repo (e.g., / or /frontend) Default value: / . Your app will not be able to access files outside of that directory. You also cannot use .. to move up a level</li>
							</ul>
						</div>
					</div>
				</section>
				<section id="build-env-vars" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-xl font-semibold">Environment variables</h2>
							<p className="text-sm mt-4 text-primary ">{SITE_NAME} can automatically inject environment variables such as API keys, database connections, or feature flags during the build:</p>
							<p className="text-sm mt-4 text-primary">{SITE_NAME} injects your environment variables into the build process during install and build..</p>
						</div>
					</div>
				</section>
				<section id="build-deployment" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Build output and deployment</h2>
								<p className="text-sm mt-4 text-primary ">Once the build completes successfully:</p>
							</div>
							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li>{SITE_NAME} uploads your build artifacts (static files, {SITE_NAME} Functions, and other assets) to the public cloud (s3).</li>
								<li>A unique deployment URL is generated (apart from the project link) (Both URLs can be used to access the deployment).</li>
								<li>Logs and build details are available in each <strong>project</strong> section of the dashboard.</li>
							</ul>
							<div>
								<p className="text-sm mt-4 text-primary ">If the build fails or times out, {SITE_NAME} provides diagnostic logs in the dashboard to help you troubleshoot. For common solutions, see our build <LinkComponent href="/docs/troubleshoot/">troubleshooting docs</LinkComponent>.</p>

							</div>
						</div>
					</div>
				</section>
				<section id="build-duration" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
				bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Build duration</h2>
								<p className="text-sm text-primary mt-4">The total build duration is shown on the {SITE_NAME} <LinkComponent href="/deployments">deployment</LinkComponent> Dashboard and includes all three steps: checking, installing, building, checking, and uploading assets.</p>
								<p className="text-sm text-primary mt-4">A Build can last for a maximum of 30 minutes. If the build exceeds this time, the deployment will be canceled and the error will be shown on the Deployment's page saying this message <CodeComponent>Failed to start build runner / Build timeout exceeded</CodeComponent>.</p>
							</div>

							<div>
								<p className="text-less text-sm mt-2">
									{SITE_NAME} enforces strict limits on build execution to ensure platform stability:
								</p>
								<ul className="list-disc pl-5 text-sm mt-3 space-y-1">
									<li><strong>Install Command:</strong> Max 10 minutes.</li>
									<li><strong>Build Command:</strong> Max 15 minutes.</li>
									<li><strong>Total Session:</strong> Max 30 minutes.</li>
								</ul>
							</div>
						</div>
					</div>
				</section>
				<section id="build-limits" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Limits and resources</h2>
								<p className="text-sm mt-4 text-primary ">{SITE_NAME} enforces certain limits to ensure reliable builds for all users:</p>
							</div>
							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li><strong>Build timeout:</strong> The maximum build time is 30 minutes. If your build exceeds this limit, it will be terminated, and the deployment fails.</li>
								<li><strong>Concurrency:</strong> Max concurrent builds for each user is decided by their plan (free - 1, pro - 3).</li>
								<li><strong>Container resources:</strong> We fairly give both sets of users (free, pro) container with a limit of 2 vCPUs and 2 GB RAM for now but these values may change in the future.</li>
								<li><strong>Build image:</strong> Builds in {SITE_NAME} get a base image of Node:22-bookworm. You can view the generated image <LinkComponent href="https://hub.docker.com/r/amal664/lynfera-builds" newPage>here</LinkComponent></li>
							</ul>
						</div>
					</div>
				</section>
			</section>




			<div className="h-[1px] w-full bg-primary" />


			<section id="Deploys" className="space-y-12">
				<div>
					<h2>Deployments</h2>
					<p className="mt-4">A deployment on {SITE_NAME} is the result of a successful build of your project. Each time you deploy, {SITE_NAME} generates a unique URL to the live environment. The current project is also updated based on the deployment status.</p>
				</div>
				<section id="deploy-dashboard" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Using the Dashboard</h2>
								<p className="text-sm mt-4 text-primary ">{SITE_NAME}'s dashboard provides a centralized way to view, manage, and gain insights into your deployments.</p>
								<p className="text-sm mt-4 text-primary ">When you select a deployment from your Project &rarr; Deployments tab, you can view each of the project’s deployments. Each deployment gives you insight into run time, logs, output files.</p>
								<p className="text-sm mt-4 text-primary ">Files &rarr; Static Assets: Files (HTML, CSS, JS) and their sizes.</p>
							</div>
						</div>
					</div>
				</section>
				<section id="deploy-manage" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Managing Deployments</h2>
								<p className="text-sm mt-4 text-primary ">From the Deployments tab, you can:</p>
							</div>
							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li><strong>Inspect:</strong> View logs and build outputs.</li>
								<li><strong>Promote to Production:</strong> Convert a preview deployment to production (if needed).</li>
							</ul>
						</div>
					</div>
				</section>

				<section id="deploy-env" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Environments</h2>
								<p className="text-sm mt-4 text-primary ">By default, {SITE_NAME} provide only a Production Enviroment.</p>
							</div>
							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li><strong>Inspect:</strong>View logs and build outputs.</li>
								<li><strong>Promote to Production:</strong>Convert a preview deployment to production (if needed).</li>
							</ul>
						</div>
					</div>
				</section>
				<section id="deploy-delete" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Delete a deployment.</h2>
								<p className="text-sm mt-4 text-primary ">By default {SITE_NAME} does not provide a deployment delete option.</p>
								<p className="text-base mt-4 text-primary "> However, you can delete a deployment by calling the API endpoint
									<CodeComponent>{process.env.NEXT_PUBLIC_API_SERVER_ENDPOINT}/project/[id]/deployments</CodeComponent> via a <CodeComponent>DELETE</CodeComponent> method that accepts deployment deletion requests.</p>
								<p className="text-base mt-4 text-primary ">By default this changes project's current deployment to its previous one if current deployment is given to delete.</p>
								<p className="text-base mt-4 text-primary ">This action is strongly discouraged due to the risk of disrupting the active deployment.  This can unintentionally change the active deployment or result in a failed deployment state.</p>
							</div>
						</div>
					</div>
				</section>
				<section id="deploy-redeploy" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Redeploy a project.</h2>
								<p className="text-base mt-4 text-primary ">Redeployment can be done by the project dashboard via three dots &rarr; Create New Deployment.</p>
								<p className="text-sm mt-4 ">Redeployment is required whenever environment variables are added, changed, or updated.</p>
							</div>
						</div>
					</div>
				</section>
				<section id="deploy-promote" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Promoting Deployments.</h2>
								<p className="text-base mt-4 text-primary ">This is a method to manually chnage your project's current deployment to another old one without creating a new deployment</p>
								<p className="text-base mt-4 text-primary ">
									Promoting an older deployment may alter the currently active version of the project. Users may observe changes to the live site upon refresh.
								</p>
								<p className="text-base mt-4 text-primary ">
									To change a project deployment:
								</p>
							</div>
							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li>Go to your project's<strong> Deployments </strong>tab</li>
								<li>Click the three dots.</li>
								<li>Select the option of promote deployment</li>
							</ul>
							<p className="text-base mt-4 text-less ">
								You can't change the project to a failed deployment.
							</p>
						</div>
					</div>
				</section>


				<section id="deploy-more" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">More Actions</h2>
							</div>
							<ul className="px-3 py-1 list-disc space-y-3 mt-3">
								<li><strong>Subdomain:</strong> A new random Subdomain is given to project when it is created. You can change it before or after deployment to have your own custom subdomain.</li>
								<li><strong>Disable/Enabling Project:</strong> Disabling project makes it not accessible to anyone. Accessing the project will display a project disabled page.</li>
								<li><strong>Delete Project:</strong> Deleting project can be done via settings tab of project. This action permanently deletes the project.</li>
							</ul>

						</div>
					</div>
				</section>
			</section>
		</main>
	)

}
export default page