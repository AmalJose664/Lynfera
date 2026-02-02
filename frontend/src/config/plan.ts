import {
	FiServer,
	FiSlash,
	FiStar,
	FiLink,
	FiPackage,
	FiHardDrive,
} from "react-icons/fi";
import { IconType } from "react-icons";
import { IoIosCube, IoMdCloudDone } from "react-icons/io";
import { GiProcessor } from "react-icons/gi";
import { IoAnalyticsSharp } from "react-icons/io5";
type EachPlanFields = {
	name: string;
	slug: string;
	pricePerMonth: number;
	maxProjects: number;
	concurrentBuilds: number;
	maxDailyDeployments: number;
	totalBandwidthGB: number;
	features?: string[];
}
export interface IPlans {
	FREE: EachPlanFields;
	PRO: EachPlanFields
}
[
	"Basic hosting",
	"Up to 8 projects",
	"Max 8 deployments daily",
	"Max 1 concurrent build process",
	"100GB Total Monthly Bandwidth",
	"No custom sub domains"
];
[
	"Priority builds",
	"Custom sub domains",
	"Up to 20 projects",
	"Max 40 deployments daily",
	"Max 3 concurrent build process",
	"1TB Total Monthly Bandwidth",
	"More resources"
]
export const PLANS: IPlans = {
	FREE: {
		name: "FREE",
		slug: "Starter",
		pricePerMonth: 0,
		maxProjects: 10,
		concurrentBuilds: 1,
		maxDailyDeployments: 18,
		totalBandwidthGB: 15,
		features: [] // call as function
	},
	PRO: {
		name: "PRO",
		slug: "Pro",
		pricePerMonth: 5,
		maxProjects: 30,
		concurrentBuilds: 3,
		maxDailyDeployments: 40,
		totalBandwidthGB: 80,
		features: [] // call as function
	},
} as const;


export function getPlanFeatures(plan: EachPlanFields): { text: string, Icon: IconType }[] {
	return [
		{ text: `Up to ${plan.maxProjects} projects`, Icon: IoIosCube },
		{ text: `Max ${plan.maxDailyDeployments} deployments daily`, Icon: IoMdCloudDone },
		{ text: `Max ${plan.concurrentBuilds} concurrent build process`, Icon: GiProcessor },
		{ text: `${plan.totalBandwidthGB}GB Total Monthly Bandwidth`, Icon: FiHardDrive },
		...(plan.pricePerMonth > 0
			? [
				{ text: "Advanced Analytics", Icon: IoAnalyticsSharp },
				{ text: "Priority builds", Icon: FiStar },
				{ text: "More resources", Icon: FiPackage },
			]
			: [
				{ text: "Simple Analytics", Icon: IoAnalyticsSharp },
				{ text: "Basic hosting", Icon: FiServer },
			]
		)
	]
}
