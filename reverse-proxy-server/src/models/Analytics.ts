export interface IAnalytics {
	projectId: string;
	path: string;
	statusCode: number;
	responseTime: number;
	responseSize: number;
	ip: string;
	uaBrowser?: string
	uaOs?: string;
	referer?: string;
	timestamp: number;
}