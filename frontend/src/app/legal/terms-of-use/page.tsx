export const metadata = {
	title: "Terms of use | Lynfera",
	description: "Lynfera platform Terms and conditions page"
}
const page = () => {
	const lastUpdated = "January 17, 2026";
	// made with ai
	return (
		<div className="min-h-screen dark:bg-background bg-white text-gray-800 font-sans leading-relaxed">
			<div className="max-w-4xl mx-auto px-6 py-20">

				<header className="mb-12">
					<h1 className="text-3xl font-bold text-primary mb-2">Terms of Service</h1>
					<p className="text-sm text-gray-500 italic">Last Updated: {lastUpdated}</p>
				</header>

				<main className="space-y-10 text-[15px]">

					<section>
						<p className="mb-4">
							These Terms of Service ("Terms") govern your access to and use of the Lynfera platform, website, and services
							(collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
							If you do not agree to these Terms, please do not use the Service.
						</p>
						<p className="mb-4">
							<strong>Note on Project Status:</strong> Lynfera is currently a hobby project developed for
							deployment automation. As such, the Service is subject to frequent updates, downtime, and
							modifications. These terms may change at any time without prior notice.
						</p>
					</section>

					{/* 1. Description of Service */}
					<section>
						<h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">1. Description of Service</h2>
						<p className="mb-4">
							Lynfera provides a cloud-based platform for the automated building, deployment, and hosting of
							frontend web applications. Our Service integrates with version control providers (e.g., GitHub)
							to fetch source code, execute build scripts, and serve resulting static assets via Amazon S3
							and a custom reverse proxy infrastructure.
						</p>
						<p className="mb-4">
							<strong>Service Limitations:</strong> Lynfera is strictly a static site hosting and build service.
							We do not provide server-side runtime environments (e.g., Node.js servers, Python backends),
							database management, or persistent server-side execution. Any attempt to bypass these
							limitations is a violation of these Terms.
						</p>
					</section>

					{/* 2. Eligibility & Accounts */}
					<section>
						<h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">2. Eligibility and Account Registration</h2>
						<p className="mb-4">
							To use Lynfera, you must be at least 13 years of age. By creating an account, you represent
							and warrant that you meet this requirement. If you are using the Service on behalf of a
							company or organization, you represent that you have the authority to bind that entity to these Terms.
						</p>
						<ul className="list-disc ml-6 space-y-2 text-some-less">
							<li><strong>Authentication:</strong> We use third-party OAuth providers (Google, GitHub) and Email/OTP for authentication. You are responsible for maintaining the security of your third-party accounts.</li>
							<li><strong>Account Responsibility:</strong> You are solely responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</li>
							<li><strong>Content Responsibility:</strong> You retain full responsibility for the code, data, and assets you deploy. Lynfera acts as a neutral host and does not pre-screen or monitor user content.</li>
						</ul>
					</section>

					<section>
						<h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">3. Usage Limits, Fees, and Payments</h2>
						<p className="mb-4">
							Lynfera offers both free and paid ("Pro") tiers. We reserve the right to modify usage limits
							and pricing at any time. Current limits include a maximum bandwidth of 100GB per month
							and limits for concurrent sites per account.
						</p>
						<p>
							<strong>Refunds:</strong> Since the service is in a hobby/testing phase, all refund requests
							are handled manually on a case-by-case basis via our support email.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">4. Acceptable Use Policy</h2>
						<p className="mb-4">
							You agree not to use the Service for any purpose that is prohibited by these Terms or by law.
							Prohibited activities include, but are not limited to:
						</p>
						<ul className="list-disc ml-6 space-y-2 text-some-less">
							<li>Deploying malware, viruses, phishing pages, or deceptive content.</li>
							<li>Hosting adult, sexually explicit, or pornographic material.</li>
							<li>Engaging in activities that violate Law or the laws of your local jurisdiction.</li>
							<li>Using the infrastructure for cryptocurrency mining, distributed computing, or as a generic file-storage service.</li>
							<li>Attempting to interfere with, compromise the system integrity, or decrypt any transmissions to or from the servers.</li>
						</ul>
						<p className="mt-4">
							<strong>Enforcement:</strong> We reserve the right, in our sole discretion, to "Instant Kill"
							(terminate without notice) any project or account that violates this AUP to protect the
							stability of our infrastructure.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">5. Intellectual Property & Open Source</h2>
						<p className="mb-4 text-some-less">
							<strong>The Software:</strong> Lynfera is an Open Source project. The source code for the platform is available
							under the MIT License. Your rights to use, copy, and modify the software are governed
							by that license.
						</p>
						<p className="mb-4 text-some-less">
							<strong>The Service & Trademark:</strong> While the source code is open, the "Lynfera" name, logo, and the
							specific hosted instance provided at this domain are the property of the project maintainers. These Terms
							do not grant you any rights to use the Lynfera trademark or branding for your own hosted versions of the software.
						</p>
						<p className="text-some-less">
							<strong>Your Content:</strong> You retain 100% ownership of the code you deploy. By using this service,
							you grant us a limited license to build and host your code solely to provide the service.
						</p>
					</section>


					<section>
						<h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">6. Disclaimers and Liability</h2>
						<p className="mb-4 uppercase font-bold text-[13px] leading-relaxed border-l-4 border-gray-200 pl-4">
							THE SERVICE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
							BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
							NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
							DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
							OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
						</p>
						<p className="text-some-less">
							As a hosted implementation of Open Source software, Lynfera does not guarantee 100% uptime,
							data persistence, or security. You use this service at your own risk.
						</p>
					</section>

				</main>
			</div>
		</div>
	)
}
export default page

