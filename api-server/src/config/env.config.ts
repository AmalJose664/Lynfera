import { z } from "zod";
import { ZodError } from "zod/v3";

const envSchema = z.object({
	MONGO_URL: z.url(),
	FRONTEND_URL: z.url(),
	REFRESH_TOKEN_SECRET: z.string(),
	ACCESS_TOKEN_SECRET: z.string(),

	API_ENDPOINT: z.url(),
	STORAGE_SERVER_ENDPOINT: z.url(),

	NODE_ENV: z.string(),

	GOOGLE_CLIENT_ID: z.string(),
	GOOGLE_CLIENT_SECRET: z.string(),
	GITHUB_CLIENT_ID: z.string(),
	GITHUB_CLIENT_SECRET: z.string(),

	CONTAINER_API_TOKEN: z.string(),
	SUBNETS_STRING: z.string(), //subnets seperated by comma

	CLOUD_ACCESSKEY: z.string(),
	CLOUD_SECRETKEY: z.string(),
	CLOUD_ENDPOINT: z.url(),


	CLUSTER_ARN: z.string(),
	TASK_ARN: z.string(),
	SECURITY_GROUPS: z.string(), // groups seperated by comma
	CLOUD_BUCKET: z.string(),

	KAFKA_USERNAME: z.string(),
	KAFKA_PASSWORD: z.string(),

	CLICKHOUSE_USERNAME: z.string(),
	CLICKHOUSE_PASSWORD: z.string(),
	CLICKHOUSE_HOST_URL_WITH_PORT: z.url(),

	STRIPE_SECRET_KEY: z.string(),
	STRIPE_PUBLISHABLE_KEY: z.string(),
	STRIPE_WEBHOOK_SECRET: z.string(),
	REDIS_URL: z.url(),
	BUILD_DISPATCH_PAT_TOKEN: z.string(),
	BUILD_DISPATCH_URL: z.string(),
});

export function validateEnv() {
	try {
		envSchema.parse(process.env);
		console.log("Env validation passed");
		return;
	} catch (err) {
		const error = err as ZodError;
		console.error("❌ Environment validation failed:");
		console.log(error);
		process.exit(1);
	}
}
