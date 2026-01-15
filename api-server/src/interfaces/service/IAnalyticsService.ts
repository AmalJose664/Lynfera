import { BufferAnalytics } from "@/models/Analytics.js";
import { QueryOptions } from "../repository/IAnalyticsRepository.js";

export type BandWidthWithProjectType = Record<string, number>;

export interface IAnalyticsService {
	saveBatch(): Promise<void>;
	addEvent(event: BufferAnalytics): Promise<void>;
	addEventBatch(event: BufferAnalytics[], bandwidthByProjectBatch: BandWidthWithProjectType): Promise<void>;
	exitService(): Promise<void>;

	getBandwidthData(projectId: string, range: string | undefined, interval: string | undefined, userPlan: string): Promise<[unknown[], QueryOptions]>;
	getOverView(projectId: string, range: string | undefined, interval: string | undefined, userPlan: string): Promise<[unknown[], QueryOptions]>;
	getRealtime(projectId: string, interval: string): Promise<[unknown[], QueryOptions]>;
	getTopPages(projectId: string, interval: string, limit: number): Promise<[unknown[], QueryOptions]>;
	getOsStats(projectId: string, interval: string): Promise<[unknown[], QueryOptions]>;
}
