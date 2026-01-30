export interface AnalyticsParamsTypes {
	projectId: string,
	range?: string,
	interval?: string,
	limit?: number
}
export interface bandWidthType {
	date: string;
	requestMB: number;
	responseMB: number;
	totalMB: number;
}
export interface overviewType {
	date: string
	requests: number,
	uniqueVisitors: number,
	avgResponseTime: number,
	totalBandwidthMb: number
}
export interface realtimeType {
	errors: number
	successful: number,
	totalRequests: number,
	avgResponseTime: number,
	p95ResponseTime: number
	totalBandwidthMb: number
	activeUsers: number
}
export interface topPagesType {
	path: string,
	requests: number,
	avgResponseTime: number
	errors: number
	totalSize: number,
}
export interface platformDistTypes {
	osStats: {
		uaOs: string;
		users: number;
		percentage: number;
	}[],
	browserStats: {
		usBrowser: string;
		users: number;
		percentage: number;
	}[]
}
