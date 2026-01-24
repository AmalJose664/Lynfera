

import { lazy, Suspense, useState, } from "react"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"
import { BsInfoCircle } from "react-icons/bs";
import RightFadeComponent from "@/components/RightFadeComponent";
import { CgClose } from "react-icons/cg";
import { useGetUserQuery } from "@/store/services/authApi";
import { LinkComponent } from "@/components/docs/HelperComponents";

const BandwidthChart = lazy(() => import("@/components/analytics/Bandwidth"));
const OverviewChart = lazy(() => import("@/components/analytics/Overview"));
const TopPages = lazy(() => import("@/components/analytics/TopPages"));
const OsStats = lazy(() => import("@/components/analytics/OsStats"));


const ProjectAnalytics = ({ projectId }: { projectId: string }) => {
	const [showNote, setShowNote] = useState(true)
	const { data: user } = useGetUserQuery()
	return (
		<div>
			{showNote &&
				<div className="mt-6 ml-4 overflow-hidden relative">
					<div className="text-start">
						<RightFadeComponent delay={1.1} duration={1} distance={140} className="border p-4 mb-3 rounded-md dark:bg-zinc-900/50 bg-white">
							<h4 className="mb-2">Note</h4>
							<div className="flex items-center gap-3">
								<BsInfoCircle className="size-4 text-blue-400" />
								<p className="text-sm">
									These results may not represent actual users. They are an approximation of the <code className="border border-blue-400/50 dark:border-blue-800/50 px-2 py-1 rounded-md mx-2">number of requests</code> received by the server.
								</p>
								<LinkComponent href="/docs/observability#analytics-data" className="text-sm">Learn more</LinkComponent>
							</div>
							<div className="flex items-center gap-3">
								<BsInfoCircle className="size-4 text-blue-400" />
								<p className="text-sm">
									This may include <code className="border border-blue-400/50 dark:border-blue-800/50 px-2 py-1 rounded-md mx-2">*.js</code>, <code className="border border-blue-400/50 dark:border-blue-800/50 px-2 py-1 rounded-md mx-2">*.css</code>, and other dependent files.
								</p>
							</div>
							<button className="absolute right-2 top-2 border p-1 rounded-md hover:bg-secondary" onClick={() => setShowNote(false)}>
								<CgClose />
							</button>
						</RightFadeComponent>
					</div>
				</div>
			}
			<Accordion type="multiple" defaultValue={["overview"]}>
				<AccordionItem value="overview" >
					<AccordionTrigger className="hover:no-underline text-xl">Traffic Overview</AccordionTrigger>
					<AccordionContent>
						<Suspense fallback={<div className="flex h-[400px] items-center justify-center">Loading...</div>}>
							<OverviewChart projectId={projectId} userPlan={user?.plan || ""} />
						</Suspense>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="bandwidth">
					<AccordionTrigger className="hover:no-underline text-xl">Bandwidth</AccordionTrigger>
					<AccordionContent>
						<Suspense fallback={<div className="flex h-[400px] items-center justify-center">Loading...</div>}>
							<BandwidthChart projectId={projectId} userPlan={user?.plan || ""} />
						</Suspense>
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="pages">
					<AccordionTrigger className="hover:no-underline text-xl">Top Pages</AccordionTrigger>
					<AccordionContent>
						<Suspense fallback={<div className="flex h-[400px] items-center justify-center">Loading...</div>}>
							<TopPages projectId={projectId} />
						</Suspense>
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="os">
					<AccordionTrigger className="hover:no-underline text-xl">Os Stats</AccordionTrigger>
					<AccordionContent>
						<Suspense fallback={<div className="flex h-[400px] items-center justify-center">Loading...</div>}>
							<OsStats projectId={projectId} />
						</Suspense>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

		</div>
	)
}
export default ProjectAnalytics