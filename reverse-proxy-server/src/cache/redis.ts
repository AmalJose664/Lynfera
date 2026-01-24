import { Redis } from 'ioredis';
import { redisClient } from '../config/redis.config.js';
import { IRedisCache } from '../interfaces/cache/IRedis.js';
import { InvalidationMessage } from './invalidationHandler.js';

class RedisService implements IRedisCache {
	private client: Redis;
	private subscriber?: Redis;
	constructor(client: Redis) {
		this.client = client;
	}

	async get<T>(key: string): Promise<T | null> {
		const value = await this.client.get(key);
		return value ? JSON.parse(value) : null;
	}

	async set(
		key: string,
		value: unknown,
		ttlSeconds?: number
	): Promise<void> {
		const data = JSON.stringify(value);

		if (ttlSeconds) {
			await this.client.set(key, data, 'EX', ttlSeconds);
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

	subscribeToInvalidations(callback: (msg: InvalidationMessage) => void): void {
		if (this.subscriber) {
			console.warn('Subscriber already exists');
			return;
		}

		this.subscriber = this.client.duplicate();
		this.subscriber.subscribe('cache:invalidate');
		this.subscriber.on('message', (channel: string, message: string) => {
			try {

				callback(JSON.parse(message));
			} catch (error) {
				console.log("error on redis message parsing", error)
			}
		});
	}
	async disconnect(): Promise<void> {
		if (this.subscriber) {
			await this.subscriber.quit();
		}
		await this.client.quit();
	}
}

export const redisService = new RedisService(redisClient)