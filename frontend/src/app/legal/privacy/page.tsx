import Navbar from "@/components/Navbar";
export const metadata = {
	title: "Privacy | Lynfera",
	description: "Lynfera platform privacy policy page"
}
const PrivacyPolicy = () => {
	const lastUpdated = "December 25, 2025";

	return (
		<>
			<div className="min-h-screen  py-16 px-6 sm:px-8">
				<div className="max-w-6xl mx-auto">
					<header className="border-b border-slate-200 pb-8 mb-12">
						<h1 className="text-4xl font-bold tracking-tight  mb-4">
							Privacy Policy
						</h1>
						<p className="text-gray-500 italic">
							Last updated: {lastUpdated}
						</p>
					</header>

					<section className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-6 mb-12 rounded-r-lg">
						<h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">The "Too Long; Didn't Read" Summary</h2>
						<ul className="list-disc list-inside space-y-2 text-blue-800 dark:text-blue-200 text-sm">
							<li>We collect basic info to make your account work (email, name, profile pic).</li>
							<li>We <strong>do not</strong> sell your data to third parties.</li>
							<li>We <strong>do not</strong> run ads or use invasive tracking scripts.</li>
							<li>We use industry-standard encryption for everything we store.</li>
						</ul>
					</section>

					<div className="space-y-12 leading-7">

						<section className="dark:bg-zinc-900/50 bg-white px-4 py-3 border rounded-md">
							<p className="text-lg text-neutral-700 dark:text-neutral-300">
								At <strong>Lynfera</strong>, we’re developers too. We know how important your privacy is. This policy explains what information we collect, why we need it, and how we keep it safe while you’re using our platform to showcase and deploy your projects.
							</p>
						</section>

						<section className="dark:bg-zinc-900/50 bg-white px-4 py-3 border rounded-md">
							<h2 className="text-2xl font-bold  mb-4 font-mono">01. Information We Collect</h2>
							<p className="mb-4">To provide a personalized experience, we collect a few specific types of information:</p>
							<ul className="list-disc pl-6 space-y-3 text-neutral-700 dark:text-neutral-300">
								<li>
									<strong>Account Details:</strong> Your name, email address, and profile picture.
								</li>
								<li>
									<strong>Authentication:</strong> We use secure methods to log you in. If you use Google or GitHub, we receive a secure token—<strong>we never see or store your third-party passwords.</strong>
								</li>
								<li>
									<strong>Usage Data:</strong> Basic technical info like your browser type and which pages you visit. This helps us squash bugs and make the platform faster.
								</li>
							</ul>
						</section>

						<section className="dark:bg-zinc-900/50 bg-white px-4 py-3 border rounded-md">
							<h2 className="text-2xl font-bold text-neutral-700 dark:text-neutral-300 mb-4 font-mono">02. How We Use Your Data</h2>
							<p>Your data isn't a product; it’s a tool to make Lynfera work for you. We use it to:</p>
							<ul className="list-disc pl-6 mt-4 space-y-2 text-neutral-700 dark:text-neutral-300">
								<li>Keep your projects secure and accessible only to you.</li>
								<li>Send critical updates about your deployments or account security.</li>
								<li>Analyze platform performance to decide which features to build next.</li>
							</ul>
						</section>

						<section className="dark:bg-zinc-900/50 bg-white px-4 py-3 border rounded-md">
							<h2 className="text-2xl font-bold text-neutral-700 dark:text-neutral-300 mb-4 font-mono">03. Payments & Subscriptions</h2>
							<p>
								When you upgrade to a paid plan, your payment is handled by specialized pros (like Stripe).
								<strong> Lynfera does not store your credit card numbers</strong> on our own servers. We only receive confirmation that the payment was successful.
							</p>
						</section>

						<section className="dark:bg-zinc-900/50 bg-white px-4 py-3 border rounded-md">
							<h2 className="text-2xl font-bold text-neutral-700 dark:text-neutral-300 mb-4 font-mono">04. Third-Party Services</h2>
							<p>
								We don't do everything ourselves. We use trusted partners for things like hosting and analytics.
								These partners only get the bare minimum data they need to function and are contractually
								bound to keep your information private.
							</p>
						</section>

						<section className="dark:bg-zinc-900/50 bg-white px-4 py-3 border rounded-md">
							<h2 className="text-2xl font-bold text-neutral-700 dark:text-neutral-300 mb-4 font-mono">05. Security</h2>
							<p>
								We treat your data like our own. We use modern encryption and security best practices to protect your info.
								That said, no platform on the internet is 100% unhackable—so we encourage you to use strong, unique passwords
								and keep your OAuth accounts secure.
							</p>
						</section>

						<section className="dark:bg-zinc-900/50 bg-white px-4 py-3 border rounded-md">
							<h2 className="text-2xl font-bold text-neutral-700 dark:text-neutral-300 mb-4 font-mono">06. Your Rights</h2>
							<p>It’s your data, after all. You have the right to:</p>
							<ul className="list-disc pl-6 mt-4 space-y-2">
								<li>See exactly what data we have on you.</li>
								<li>Correct anything that’s wrong.</li>
								<li>Request that we delete your account and all associated data.</li>
							</ul>
						</section>
					</div>
				</div>
			</div>
		</>
	);
};

export default PrivacyPolicy;