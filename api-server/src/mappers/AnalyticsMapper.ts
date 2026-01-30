import { QueryOptions } from "@/interfaces/repository/IAnalyticsRepository.js";

type meta = Record<string, string | number>;
interface bandWidthType {
	date: string;
	requestMB: number;
	responseMB: number;
	totalMB: number;
}
interface overviewType {
	date: string;
	requests: number;
	uniqueVisitors: number;
	avgResponseTime: number;
	totalBandwidthMb: number;
}
interface realtimeType {
	errors: number;
	successful: number;
	totalRequests: number;
	avgResponseTime: number;
	p95ResponseTime: number;
	totalBandwidthMb: number;
	activeUsers: number;
}
interface topPagesType {
	path: string;
	requests: number;
	avgResponseTime: number;
	errors: number;
	totalSize: number;
}
interface platformDistTypes {
	osStats: {
		uaOs: string;
		users: number;
		percentage: number;
	}[],
	browserStats: {
		uaBrowser: string;
		users: number;
		percentage: number;
	}[]
}

export class AnalyticsMapper {
	static bandwidthResponseDTO(
		data: unknown[],
		projectId: string,
		meta: QueryOptions,
	): {
		projectId: string;
		data: bandWidthType[];
		meta: meta;
	} {
		return {
			projectId,
			data: data.map((d: any) => ({
				date: d.time,
				requestMB: parseFloat(d.request_mb.toFixed(2)),
				responseMB: parseFloat(d.response_mb.toFixed(2)),
				totalMB: parseFloat(d.total_mb.toFixed(2)),
			})),
			meta: { ...meta, total: data.length } as unknown as meta,
		};
	}

	static overviewResponse(
		data: unknown[],
		projectId: string,
		meta: QueryOptions,
	): {
		projectId: string;
		data: overviewType[];
		meta: meta;
	} {
		return {
			projectId,
			data: data.map((d: any) => ({
				date: d.time,
				avgResponseTime: parseFloat(d.avg_response_time.toFixed(2)),
				uniqueVisitors: Number(d.unique_visitors),
				requests: Number(d.requests),
				totalBandwidthMb: parseFloat(d.total_bandwidth_mb.toFixed(2)),
			})),
			meta: { ...meta, total: data.length } as unknown as meta,
		};
	}
	static realtimeResponse(
		data: any[],
		projectId: string,
		meta: QueryOptions,
	): {
		projectId: string;
		data: realtimeType;
		meta: meta;
	} {
		return {
			projectId,
			data: {
				totalRequests: Number(data[0].total_requests),
				errors: Number(data[0].errors),
				successful: Number(data[0].successful),
				avgResponseTime: parseFloat(data[0].avg_response_time.toFixed(2)),
				p95ResponseTime: parseFloat(data[0].p95_response_time.toFixed(2)),
				totalBandwidthMb: parseFloat(data[0].total_bandwidth.toFixed(2)),
				activeUsers: Number(data[0].active_users),
			},

			meta: { ...meta, total: data.length } as unknown as meta,
		};
	}
	static topPagesResponse(
		data: any[],
		projectId: string,
		meta: QueryOptions,
	): {
		projectId: string;
		data: topPagesType[];
		meta: meta;
	} {
		return {
			projectId,
			data: data.map((d: any) => ({
				path: d.path,
				requests: Number(d.requests),
				errors: Number(d.errors),
				totalSize: parseFloat(d.total_size.toFixed(2)),
				avgResponseTime: parseFloat(d.avg_response_time.toFixed(2)),
			})),

			meta: { ...meta, total: data.length } as unknown as meta,
		};
	}
	static platformResponse(
		data: {
			osStats: unknown[];
			browserStats: unknown[];
		},
		projectId: string,
		meta: QueryOptions,
	): {
		projectId: string;
		data: platformDistTypes;
		meta: meta;
	} {
		const { osStats, browserStats } = data
		console.log({ browserStats, osStats })
		return {
			projectId,
			data: {
				osStats: osStats.map((d: any) => ({
					uaOs: d.ua_os,
					users: Number(d.users),
					percentage: Number(d.percentage),
				})),
				browserStats: browserStats.map((d: any) => ({
					uaBrowser: d.ua_browser,
					users: Number(d.users),
					percentage: Number(d.percentage),
				}))
			},

			meta: { ...meta, totals: { osStat: osStats.length, browserStat: browserStats.length } } as unknown as meta,
		};
	}
}
