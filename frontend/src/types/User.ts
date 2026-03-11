import { IPlans } from "@/config/plan"

export interface User {
	name: string
	profileImage: string
	_id: string
	plan: string
}
export interface UserDetailed {
	name: string
	profileImage: string
	email: string
	projects: number
	bandwidthMonthly: number
	plan: keyof IPlans
	deploymentsToday: number
	createdAt: Date
	_id: string
	connectedAccounts: string[]
}
export type GithubIdsOutput = { githubInstallationId: number, githubAccountId: number }


export interface GithubRepoResponse {
	id: number;
	node_id: string;
	name: string;
	full_name: string;
	private: boolean;
	description: string | null;
	html_url: string;
	pushAt: string
}