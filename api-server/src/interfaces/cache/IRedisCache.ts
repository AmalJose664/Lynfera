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

	incrementKey(key: string): Promise<number>;
	decrementKey(key: string): Promise<number>;
	setKeyExpiry(key: string, time: number): Promise<number>;
}

export interface ICacheAnalytics {
	responseSize: number;
	responseTime: string;
	projectId: string;
}
