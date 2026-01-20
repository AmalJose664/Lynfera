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
export const PLANS: IPlans = {
	FREE: {
		name: "FREE",
		slug: "Starter",
		pricePerMonth: 0,
		maxProjects: 10,
		concurrentBuilds: 1,
		maxDailyDeployments: 8,
		totalBandwidthGB: 100,
		features: [] // view in frontend code
	},
	PRO: {
		name: "PRO",
		slug: "Pro",
		pricePerMonth: 5,
		maxProjects: 30,
		concurrentBuilds: 3,
		maxDailyDeployments: 40,
		totalBandwidthGB: 1000,
		features: [] // view in frontend code
	},
} as const;
