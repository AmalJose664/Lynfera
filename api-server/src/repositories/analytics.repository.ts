import { ClickHouseClient } from "@clickhouse/client";

import { IAnalyticsRepository, QueryOptions } from "@/interfaces/repository/IAnalyticsRepository.js";
import { BufferAnalytics } from "@/models/Analytics.js";

class AnalyticsRepository implements IAnalyticsRepository {
	private client: ClickHouseClient;

	constructor(client: ClickHouseClient) {
		this.client = client;
	}
	async insertBatch(data: BufferAnalytics[]): Promise<void> {
		if (data.length === 0) return;
		const recordStartTime = performance.now();
		await this.client.insert({
			table: "analytics",
			values: data,
			format: "JSONEachRow",
			clickhouse_settings: {
				async_insert: 1,
				wait_for_async_insert: 0,
			},
		});

		console.log(`Network time: ${(performance.now() - recordStartTime).toFixed(2)}ms`);
	}
	async insertSingle(data: BufferAnalytics): Promise<void> {
		this.insertBatch([data]);
	}
	async clearProjectAnalytics(projectId: string): Promise<void> {
		await this.client.query({
			query: `ALTER TABLE analytics DELETE WHERE project_id = {projectId:String}`,
			query_params: { projectId },
		});
	}
	async getBandwidth(projectId: string, queryOptions: QueryOptions): Promise<unknown[]> {
		const result = await this.client.query({
			query: `SELECT 
          	toStartOfInterval(
            toTimeZone(timestamp, 'Asia/Kolkata'), 
            INTERVAL {interval:UInt32} ${queryOptions.intervalUnit}
          	) as time,
          	4000 / 1024 / 1024 as request_mb,
          	sum(response_size) / 1024 / 1024 as response_mb,
          	sum(response_size) / 1024 / 1024 as total_mb
        	FROM analytics
        	WHERE project_id = {projectId:String}
          	AND timestamp >= now() - INTERVAL  {range:UInt32} ${queryOptions.rangeUnit}
        	GROUP BY time
        	ORDER BY time
      `,

			query_params: {
				projectId,
				range: queryOptions.range,
				interval: queryOptions.interval,
			},
			format: "JSONEachRow",
		});

		return await result.json();
	}
	async getOverview(projectId: string, queryOptions: QueryOptions): Promise<unknown[]> {
		const result = await this.client.query({
			query: `SELECT
  			toStartOfInterval(
    		toTimeZone(timestamp, 'Asia/Kolkata'),
    		INTERVAL {interval:UInt32} ${queryOptions.intervalUnit}
  			) as time,
  			count() as requests,
  			uniq(ip) as unique_visitors,
  			avg(response_time) as avg_response_time,
  			(SUM(response_size)) / 1024 / 1024 as total_bandwidth_mb
			FROM analytics
			WHERE project_id = {projectId:String}
			AND date >= toDate(now() - INTERVAL {range:UInt32} ${queryOptions.rangeUnit})
  			AND timestamp >= now() - INTERVAL {range:UInt32} ${queryOptions.rangeUnit}
			GROUP BY time
			ORDER BY time`,
			//AND date >= toDate(now() - INTERVAL {range:UInt32} ${queryOptions.rangeUnit})
			query_params: {
				projectId,
				range: queryOptions.range,
				interval: queryOptions.interval,
			},
			format: "JSONEachRow",
		});

		return await result.json();
	}
	async getRealtime(projectId: string, queryOptions: QueryOptions): Promise<unknown[]> {
		const result = await this.client.query({
			query: `SELECT 
    		count() as total_requests,
    		countIf(status_code >= 400) as errors,
    		countIf(status_code < 400) as successful,
    		avg(response_time) as avg_response_time,
    		quantile(0.95)(response_time) as p95_response_time,
    		(SUM(response_size)) / 1024 / 1024 as total_bandwidth,
    		uniq(ip) as active_users
			FROM analytics
			WHERE project_id = {projectId:String}
  			AND timestamp >= now() - INTERVAL {interval:UInt32} ${queryOptions.intervalUnit}`,

			query_params: {
				projectId,
				interval: queryOptions.interval,
			},
			format: "JSONEachRow",
		});

		return await result.json();
	}
	async getTopPages(projectId: string, queryOptions: QueryOptions): Promise<unknown[]> {
		const result = await this.client.query({
			query: `SELECT 
    		path,
    		count() as requests,
    		avg(response_time) as avg_response_time,
    		SUM(response_size) / 1024 / 1024 as total_size,
    		countIf(status_code >= 400) as errors
			FROM analytics
			WHERE project_id = {projectId:String}
  			AND timestamp >= now() - INTERVAL {interval:UInt32} ${queryOptions.rangeUnit}
			GROUP BY path
			ORDER BY requests DESC
			LIMIT {limit:UInt32}
			`,

			query_params: {
				projectId,
				interval: queryOptions.range,
				limit: queryOptions.limit,
			},
			format: "JSONEachRow",
		});

		return await result.json();
	}
	async getOsStats(projectId: string, queryOptions: QueryOptions): Promise<unknown[]> {
		const result = await this.client.query({
			query: `SELECT 
    		ua_os,
    		count() as users,
    		(count() * 100.0 / sum(count()) OVER ()) as percentage
			FROM analytics
			WHERE project_id = {projectId:String}
  			AND timestamp >= now() - INTERVAL {interval:UInt32} ${queryOptions.rangeUnit}
  			AND ua_os IS NOT NULL
			GROUP BY ua_os
			ORDER BY users DESC
			`,

			query_params: {
				projectId,
				interval: queryOptions.range,
			},
			format: "JSONEachRow",
		});

		return await result.json();
	}
	async getBrowserStats(projectId: string, queryOptions: QueryOptions): Promise<unknown[]> {
		const result = await this.client.query({
			query: `SELECT 
    		ua_browser,
    		count() as users,
    		(count() * 100.0 / sum(count()) OVER ()) as percentage
			FROM analytics
			WHERE project_id = {projectId:String}
  			AND timestamp >= now() - INTERVAL {interval:UInt32} ${queryOptions.rangeUnit}
  			AND ua_browser IS NOT NULL
			GROUP BY ua_browser
			ORDER BY users DESC
			`,

			query_params: {
				projectId,
				interval: queryOptions.range,
			},
			format: "JSONEachRow",
		});

		return await result.json();
	}
}

export default AnalyticsRepository;
