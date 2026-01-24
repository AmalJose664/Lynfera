import { LinkComponent } from "@/components/docs/HelperComponents";
import { SITE_NAME } from "@/config/constants";

export const metadata = {
	title: "Getting Started | " + SITE_NAME,
	description:
		"Learn how to set up, configure, and deploy your first static application step by step.",
};


const Page = () => {
	return (
		<NewPage />
	);
};

const NewPage = () => {
	return (
		<main className="space-y-12  px-4">
			<div className="w-full border-b pb-2">
				<h2 className="text-4xl">Getting Started</h2>
			</div>
			<section id="starting-intro" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">

				<div className="pt-8 px-4 mb-6">
					<h2 className="text-2xl font-semibold">Introduction</h2>
					<p className="text-sm text-primary mt-2">
						Welcome to {SITE_NAME}. We’ve designed the onboarding process to be as lean as possible—no complex permissions or app installations required. We clone, we build, and we deploy.</p>
				</div>
			</section>
			<section id="getting-started" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
				<div className="overflow-x-auto dark:bg-[#101010]/60 bg-white">
					<div className="px-4 py-4">
						<h2 className="text-xl font-semibold">Before you begin</h2>
						<p className="text-sm text-less mt-1">To get started, create an account with {SITE_NAME}.</p>
						<ul className="px-3 py-1 list-disc space-y-3 mt-3">
							<li><LinkComponent href="/signup">Sign up</LinkComponent>for a new {SITE_NAME} account</li>
							<li><LinkComponent href="/login">Log In</LinkComponent> to your existing {SITE_NAME} account</li>
						</ul>
						<p className="text-sm mt-2 text-primary">Once you create an account, you can choose to authenticate either with a Git provider or by using an email. When using email authentication, you may need to confirm both your email using OTP.</p>
					</div>
				</div>
			</section>

			<section id="gs-projects-deployment" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">
				<div className="overflow-x-auto dark:bg-[#101010]/60 bg-white">
					<div className="px-4 py-4">
						<h2 className="text-xl font-semibold">Understanding Projects & Deployments</h2>
						<p className="text-sm text-less mt-1">To get started with {SITE_NAME}, it's helpful to understand projects and deployments:</p>
						<ul className="px-3 py-1 list-disc space-y-3 mt-3 tracking-wide leading-relaxed">
							<li>Projects: A project is the application that you have deployed to {SITE_NAME}. You can have multiple projects connected to a single repository (for example, a monorepo), and multiple deployments for each project. You can view all your projects on the dashboard, and configure your settings through the project dashboard.</li>
							<li>Deployments: A deployment is the result of a successful build of your project.</li>
						</ul>
					</div>
				</div>
			</section>
			<section id="start-project" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white">

				<div className="overflow-x-auto dark:bg-[#101010]/60 bg-white">
					<div className="px-4 py-4">
						<h2 className="text-xl font-semibold">Starting a project</h2>
						<p className="text-base mt-3 text-primary tracking-wide leading-relaxed">
							Lynfera hosts any static web project. We automatically detect your framework settings to ensure optimal build and deployment configurations.
						</p>
						<p className="text-base mt-3 text-primary tracking-wide leading-relaxed">
							We currently clone public repositories directly into our secure build environment—no access tokens required. More features for private repos are coming soon.
						</p>
					</div>
					<div className="mt-4 px-8 pb-6">
						<ul className="list-disc space-y-3 text-primary tracking-wide ">
							<li className="">
								Go to the <LinkComponent href="/new">New Project</LinkComponent> page
							</li>
							<li className="">
								Fill out the project details: **Project Name**, **Public Git URL**, and **Branch**.
							</li>
							<li className="">
								(Optional) Open **Advanced Settings** to configure monorepo root directories, custom build/install commands, or environment variables. <LinkComponent href="/docs/build-deploy#build-customize">More info</LinkComponent>
							</li>
							<li className="">
								Click **Deploy** to start your first build.
							</li>
						</ul>
					</div>
				</div>
			</section>
		</main>
	)
}

export default Page;

