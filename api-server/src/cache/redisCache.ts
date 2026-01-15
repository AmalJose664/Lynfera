import { IRedisCache } from "@/interfaces/cache/IRedisCache.js";
import { Redis } from "ioredis";

class RedisService implements IRedisCache {
	private client: Redis;
	constructor(client: Redis) {
		this.client = client;
	}

	async get<T>(key: string): Promise<T | null> {
		const value = await this.client.get(key);
		return value ? JSON.parse(value) : null;
	}

	async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
		const data = JSON.stringify(value);

		if (ttlSeconds) {
			await this.client.set(key, data, "EX", ttlSeconds);
		} else {
			await this.client.set(key, data, "EX", 1800);
		}
	}

	async del(key: string): Promise<void> {
		await this.client.del(key);
	}

	async exists(key: string): Promise<boolean> {
		return (await this.client.exists(key)) === 1;
	}

	async setAdd(key: string, value: string): Promise<number> {
		return await this.client.sadd(key, value);
	}
	async setRemove(key: string, value: string): Promise<number> {
		return await this.client.srem(key, value);
	}
	async getSetLength(key: string): Promise<number> {
		return await this.client.scard(key);
	}

	async publishInvalidation(type: string, slug: string): Promise<number> {
		return this.client.publish("cache:invalidate", JSON.stringify({ type, slug }));
	}
	async publishBuild(data: { deploymentId: string; projectId: string; envs: { name: string; value: string }[] }): Promise<number> {
		return this.client.publish("build:start", JSON.stringify(data));
	}
	async disconnect(): Promise<void> {
		await this.client.quit();
	}
}

export default RedisService;
