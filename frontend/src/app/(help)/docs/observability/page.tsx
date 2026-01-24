import { CodeComponent, LinkComponent } from "@/components/docs/HelperComponents"
import { SITE_NAME } from "@/config/constants"


export const metadata = {
	title: "Logs ana Anallytics | " + SITE_NAME,
	description:
		"Get Details about how logs and analytics are stored.",
};


const page = () => {
	return (
		<main className="px-4 space-y-16">
			<div className="w-full border-b pb-2">
				<h2 className="text-4xl">Logs and Analytics</h2>

			</div>
			<section id="logs" className="space-y-12">
				<div>
					<h2 className="text-2xl">Build Logs</h2>
				</div>
				<section id="logs-basic" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<h2 className="text-lg">Logs</h2>
							<p className="text-base mt-4 leading-8 text-primary">
								When you deploy your website to {SITE_NAME}, the platform generates build logs that show the deployment progress. The build logs contain information about:
							</p>
							<div>
								<ul className="px-3 py-1 list-disc space-y-3 mt-3">
									<li>The version of the build tools</li>
									<li>Warnings or errors encountered during the build process</li>
									<li>Details about the files and dependencies that were installed, compiled, or built during the deployment</li>
								</ul>
							</div>
						</div>
					</div>
				</section>
				<section id="logs-working" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
				bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Build Logs working</h2>
								<p className="text-base mt-4 leading-8 text-primary">
									Build logs are generated at build time for all <LinkComponent href="/docs/getting-started#gs-projects-deployment">Deployments</LinkComponent>. The logs are similar to your framework's Build Command output, with a few minor additions from the {SITE_NAME} build system. Once a build is complete, no new logs will be recorded.
								</p>
								<p className="text-base mt-4 leading-8 text-primary">
									In addition to the list of build actions, you can also find errors or warnings. These are highlighted with different colors, such as yellow for warnings and red for errors. This color coding makes it flexible to investigate why your build failed and which part of your website is affected.
								</p>
								<p className="text-base mt-4 leading-8 text-primary">
									Each type are:
								</p>
							</div>
							<div>
								<ul className="px-3 py-1 list-disc space-y-3 mt-3">
									<li><CodeComponent>INFO</CodeComponent> - General logs</li>
									<li><CodeComponent>WARN</CodeComponent> - Warnings</li>
									<li><CodeComponent>ERROR</CodeComponent> - Errors. Mostly this shows why your build fails</li>
									<li><CodeComponent>DECOR</CodeComponent> - Decorations. These are just branding decorations. It also shows build specifications</li>
								</ul>
							</div>
						</div>
					</div>
				</section>
				<section id="logs-save" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
				bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Saving logs</h2>
								<p className="text-base mt-4 leading-8 text-primary">
									You can download the logs as a txt file.
								</p>
							</div>
						</div>
					</div>
				</section>
				<section
					id="logs-retention"
					className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white"
				>
					<div className="overflow-x-auto">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Log Retention</h2>

								<p className="text-base mt-4 leading-8 text-primary">
									Logs are stored for up to <strong>25 days</strong>. Logs older than this
									period are automatically deleted and cannot be recovered.
								</p>

								<p className="text-base mt-3 leading-8 text-primary">
									Log entries include standard log levels such as <CodeComponent>info</CodeComponent>,
									<CodeComponent> warn</CodeComponent>, and <CodeComponent>error</CodeComponent>. For performance and
									decoration-related logs <CodeComponent>(DECOR)</CodeComponent>, only the most recent <strong>5 days</strong> of
									data are retained.
								</p>

								<p className="text-base mt-3 leading-8 text-primary">
									Retention limits help balance observability, storage efficiency, and
									system performance while keeping recent logs readily available for
									troubleshooting.
								</p>
							</div>
						</div>
					</div>
				</section>


			</section>
			<div className="h-[1px] w-full bg-primary" />
			<section id="analytics" className="space-y-12">
				<div>
					<h2 className="text-2xl">Analytics</h2>
				</div>
				<section id="analytics-overview" className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 
				bg-white ">
					<div className="overflow-x-auto ">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Overview</h2>
								<p className="text-base mt-4 leading-8 text-primary">
									Web Analytics provides comprehensive insights into your website's visitors, allowing you to track the top visited pages, referrers for a specific page, and demographics like location, operating systems, and browser information. {SITE_NAME}'s Web Analytics offers:
								</p>
							</div>
							<div>
								<ul className="px-3 py-1 list-disc space-y-3 mt-3">
									<li><strong>Privacy:</strong> Web Analytics only stores anonymized data and does not use cookies, providing data for you while respecting your visitors' privacy and web experience.</li>
									<li><strong>Integrated Infrastructure:</strong> Web Analytics is built into the {SITE_NAME} platform and accessible from your project's dashboard so there's no need for third-party services for detailed visitor insights.</li>
								</ul>
							</div>
						</div>
					</div>
				</section>

				<section
					id="analytics-visitors"
					className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white"
				>
					<div className="overflow-x-auto">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Visitors</h2>
								<p className="text-base mt-4 leading-8 text-primary">
									Visitors are identified from incoming HTTP requests to your project.
									Analytics are primarily calculated from <strong>non-cached requests</strong>,
									which means only requests that reach our servers are tracked. As a result,
									visitor metrics may represent a subset of total traffic.
								</p>

								<p className="text-base mt-4 leading-8 text-primary">
									We collect lightweight request and client metadata—such as paths,
									response status, device type, and timestamps—to generate visitor counts,
									performance insights, and usage trends. No raw request bodies or
									application-level data are stored.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section
					id="analytics-views"
					className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white"
				>
					<div className="overflow-x-auto">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Analytics Views</h2>
								<p className="text-base mt-4 leading-8 text-primary">
									Analytics are divided into focused views, each highlighting a specific
									aspect of your traffic and usage patterns.
								</p>
							</div>
							<div>
								<ul className="px-3 py-1 list-disc space-y-3 mt-3">
									<li><strong>Overview</strong> shows total requests, unique requests, and
										average response time.</li>
									<li><strong>Bandwidth</strong> displays request and
										response bandwidth usage.
									</li>
									<li><strong>Top Pages</strong> highlights the mostrequested paths.</li>
									<li><strong>OS Stats</strong> breaks down traffic by
										operating system and device type.
									</li>
								</ul>
							</div>
							<div>
								<p className="text-sm mt-3 leading-8 text-primary">
									All views support selectable time ranges: last hour, 24 hours, 1 week,
									and 1 month. Overview and Bandwidth also support adjustable time
									intervals; interval customization requires a Pro account.
								</p>
							</div>
						</div>
					</div>
				</section>
				<section
					id="analytics-data"
					className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white"
				>
					<div className="overflow-x-auto">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Chart Data</h2>
								<p className="text-sm mt-4 leading-8 text-primary">
									By default, the Unique visitors chart counts different IP addresses engaging with your site within a single day. If someone loads pages of your site on multiple different days, they will be counted as a unique visitor for each day. If you select the 24 hours filter, then the chart will plot different IP addresses engaging with your site within a single hour. If someone loads pages of your site during multiple different hours, they will be counted as a unique visitor for each hour. The Total unique visitors for your site will typically be less than the sum of daily or hourly values because the total counts IP addresses that are unique across the whole charted time period.
								</p>
								<p className="text-sm mt-4 leading-8 text-primary">
									Bandwidth used tracks all visitor traffic including 304 responses and 404 errors. This does not include {SITE_NAME} activity such as building and deploying your site. Bandwidth is primarily calculated from response headers and represents the Content-Length of returned files.
								</p>
								<p className="text-sm mt-4 leading-8 text-primary">
									Requests represent the total number of HTTP requests received by the server and may not reflect the actual number of users. This count is an approximation and can include requests for assets such as .js, .css, images, and other dependent files.
								</p>
							</div>
						</div>
					</div>
				</section>
				<section
					id="analytics-retention"
					className="scroll-mt-12 border rounded-md overflow-hidden dark:bg-[#101010]/60 bg-white"
				>
					<div className="overflow-x-auto">
						<div className="px-4 py-4">
							<div>
								<h2 className="text-xl font-semibold">Analytics Retention</h2>

								<p className="text-base mt-4 leading-8 text-primary">
									Analytics data is stored for up to <strong>1 month</strong>. Data older
									than this period is automatically deleted and cannot be recovered.
								</p>

								<p className="text-base mt-3 leading-8 text-primary">
									Stored analytics include aggregated request metrics, performance data,
									and usage breakdowns such as pages, platforms, and bandwidth. Raw request
									payloads and application-level data are not retained.
								</p>

								<p className="text-base mt-3 leading-8 text-primary">
									Retention limits help ensure predictable storage usage and protect user
									privacy while still providing meaningful insights into recent traffic
									patterns.
								</p>
							</div>
						</div>
					</div>
				</section>

			</section>

		</main>
	)

}
export default page

