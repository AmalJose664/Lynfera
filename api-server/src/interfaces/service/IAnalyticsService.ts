import { BufferAnalytics } from "@/models/Analytics.js";
import { QueryOptions } from "../repository/IAnalyticsRepository.js";

export type BandWidthWithProjectType = Record<string, number>;
export type QueryOptionsString = {
	range?: string,
	interval?: string,
	limit?: number,

}
export interface IAnalyticsService {
	saveBatch(): Promise<void>;
	addEvent(event: BufferAnalytics): Promise<void>;
	addEventBatch(event: BufferAnalytics[], bandwidthByProjectBatch: BandWidthWithProjectType): Promise<void>;
	exitService(): Promise<void>;

	clearAnalytics(projectId: string): Promise<void>
	getBandwidthData(projectId: string, userPlan: string, queryOptionsString?: QueryOptionsString): Promise<[unknown[], QueryOptions]>;
	getOverView(projectId: string, userPlan: string, queryOptionsString?: QueryOptionsString): Promise<[unknown[], QueryOptions]>;
	getRealtime(projectId: string, queryOptionsString?: QueryOptionsString): Promise<[unknown[], QueryOptions]>;
	getTopPages(projectId: string, userPlan: string, queryOptionsString?: QueryOptionsString): Promise<[unknown[], QueryOptions]>;
	getPlatformStats(projectId: string, userPlan: string, queryOptionsString?: QueryOptionsString): Promise<[{ osStats: unknown[], browserStats: unknown[] }, QueryOptions]>;
}
