import { ENVS } from "@/config/env.config.js";
import { Redis } from "ioredis";
export const redisClient = new Redis((ENVS.REDIS_URL as string) || "");
export const redisEmitterPublisher = new Redis((ENVS.REDIS_URL as string) || "");
export const redisEmitterSubscriber = redisClient;
