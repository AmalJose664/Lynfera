export interface IPlans {
	FREE: {
		name: string;
		slug: string;
		pricePerMonth: number;
		maxProjects: number;
		maxDailyDeployments: number;
		totalBandwidthGB: number;
		features: string[];
	};
	PRO: {
		name: string;
		slug: string;
		pricePerMonth: number;
		maxProjects: number;
		maxDailyDeployments: number;
		totalBandwidthGB: number;
		features: string[];
	};
}
export const PLANS: IPlans = {
	FREE: {
		name: "FREE",
		slug: "Starter",
		pricePerMonth: 0,
		maxProjects: 8,
		maxDailyDeployments: 8,
		totalBandwidthGB: 100,
		features: ["Basic hosting", "Up to 8 projects", "Max 8 deployments daily", "100GB Total Bandwidth", "No custom sub domains"],
	},
	PRO: {
		name: "PRO",
		slug: "Pro",
		pricePerMonth: 5,
		maxProjects: 20,
		maxDailyDeployments: 40,
		totalBandwidthGB: 1000,
		features: ["Priority builds", "Custom sub domains", "Up to 20 projects", "Max 40 deployments daily", "1TB Total Bandwidth", "More resources"],
	},
} as const;
