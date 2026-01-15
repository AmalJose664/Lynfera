export interface IRedisCache {
	get<T>(key: string): Promise<T | null>;
	set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
	del(key: string): Promise<void>;
	exists(key: string): Promise<boolean>;

	setAdd(key: string, value: string): Promise<number>;
	setRemove(key: string, value: string): Promise<number>;
	getSetLength(key: string): Promise<number>;
	disconnect(): Promise<void>;
	publishInvalidation(type: string, slug: string): Promise<number>;
}

export interface ICacheAnalytics {
	responseSize: number;
	responseTime: string;
	projectId: string;
}
