import { BufferAnalytics } from "@/models/Analytics.js";

export interface QueryOptions {
	range?: number;
	rangeUnit?: string;
	interval?: number;
	intervalUnit?: string;
	limit?: number;
}
export interface IAnalyticsRepository {
	insertBatch(data: BufferAnalytics[]): Promise<void>;
	insertSingle(data: BufferAnalytics): Promise<void>;

	getBandwidth(projectId: string, queryOptions: QueryOptions): Promise<unknown[]>;
	getOverview(projectId: string, queryOptions: QueryOptions): Promise<unknown[]>;
	getRealtime(projectId: string, queryOptions: QueryOptions): Promise<unknown[]>;
	getTopPages(projectId: string, queryOptions: QueryOptions): Promise<unknown[]>;
	getOsStats(projectId: string, queryOptions: QueryOptions): Promise<unknown[]>;
}
