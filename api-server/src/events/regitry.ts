import { ZodError } from "zod";
import { EachBatchPayload, Offsets } from "kafkajs";

import { EventConfig, EventRegistryType } from "@/events/types/event.js";
import { DeploymentLogEventSchema, DeploymentUpdatesEventSchema } from "@/events/schemas/deployment.schema.js";
import DeploymentEventHandler from "@/events/handlers/deployment.handler.js";
import ProjectAnalyticsHandler from "@/events/handlers/analytics.handler.js";
import { AnalyticsEvent, analyticsEventSchema } from "@/events/schemas/analytics.schema.js";
import { BandWidthWithProjectType } from "@/interfaces/service/IAnalyticsService.js";
import { BufferAnalytics } from "@/models/Analytics.js";

export const EVENT_REGISTRY: EventRegistryType = {
	logs: {
		"deployment.logs": {
			topic: "deployment.logs", // <------- Actual kafka topic name
			handler: DeploymentEventHandler.handleLogs,
			schema: DeploymentLogEventSchema,
			processFn: processLogEvent,
			description: "Real-time deployment build logs",
		},
		"deployment.updates": {
			topic: "deployment.updates", // <------- Actual kafka topic name
			handler: DeploymentEventHandler.handleUpdates,
			processFn: processLogEvent,
			schema: DeploymentUpdatesEventSchema,
			description: "Deployment, Project status transitions, data updations",
		},
	},
	analytics: {
		"project.analytics": {
			topic: "project.analytics", // <------- Actual kafka topic name
			handler: ProjectAnalyticsHandler.handleDataBatch,
			processFn: processAnalyticsEvent,
			schema: analyticsEventSchema,
			description: "Project analytics",
		},
	},
};

const KAFKA_MESSAGE_SAVE_RETRIES = 3;
const KAFKA_MESSAGE_RETRY_INITIAL_DELAY = 750;

export function getAllTopics() {
	return Object.values(EVENT_REGISTRY).map((types) => Object.values(types).map((field) => field.topic));
}
export function getEventConfig(topic: string, type: "logs" | "analytics"): EventConfig | undefined {
	return EVENT_REGISTRY[type][topic];
}
export function getEventProcessFn(topic: string, type: "logs" | "analytics"): EventConfig["processFn"] {
	return EVENT_REGISTRY[type][topic].processFn;
}
export function getEventSchema(topic: string, type: "logs" | "analytics"): EventConfig["schema"] {
	return EVENT_REGISTRY[type][topic].schema;
}

export async function processLogEvent(data: unknown, topic: string, type: "logs" | "analytics") {
	const config = getEventConfig(topic, type);

	if (!config) {
		throw new Error(`No handler registered for topic: ${topic}`);
	}
	let attempt = 0;
	let processed = false;

	while (!processed && attempt < KAFKA_MESSAGE_SAVE_RETRIES) {
		try {
			const parsedData = config.schema.parse(data);
			await config.handler(parsedData, attempt != 0);
			processed = true;
		} catch (error: any) {
			if (error instanceof ZodError) {
				console.log("Error on parsing data ", error, data, "\nReturning...");
				return;
			}
			attempt++;
			console.error(`Error processing message (attempt ${attempt}):`, {
				value: data,
				error: error.message,
			});
			if (attempt < KAFKA_MESSAGE_SAVE_RETRIES && !processed) {
				const baseDelay = KAFKA_MESSAGE_RETRY_INITIAL_DELAY * 2 ** (attempt - 1);
				const jitter = Math.random() * 0.3 * baseDelay;
				const delay = Math.min(baseDelay + jitter, 30000);
				await new Promise((resolve) => setTimeout(resolve, delay));
			} else {
				console.log("Max retries reached skipping message");
			}
		}
	}
}

export async function processAnalyticsEvent(
	data: { events: {}[]; calculatedBandwidth: Record<string, number> },
	topic: string,
	type: "logs" | "analytics",
) {
	const config = getEventConfig(topic, type);

	if (!config) {
		throw new Error(`No handler registered for topic: ${topic}`);
	}

	await config.handler(data, false);
}

export async function processConumerLogs({ batch, heartbeat, commitOffsetsIfNecessary, resolveOffset }: EachBatchPayload) {
	const processFn = getEventProcessFn(batch.topic, "logs");
	await Promise.all(
		batch.messages.map(async (msg) => {
			try {
				const data = JSON.parse(msg.value?.toString() as any);
				processFn(data, batch.topic, "logs");

				resolveOffset(msg.offset);
			} catch (error: any) {
				console.error("Failed to process message:", error); // send to dlq task-------
				resolveOffset(msg.offset);
			}

			commitOffsetsIfNecessary(msg.offset as unknown as Offsets);
			await heartbeat();
		}),
	);
}

export async function processConumerAnalytics({ batch }: EachBatchPayload) {
	process.stdout.write(" ** ->" + batch.messages.length);
	const schema = getEventSchema(batch.topic, "analytics");
	const processFn = getEventProcessFn(batch.topic, "analytics");
	const bandwidthByProjectBatch: BandWidthWithProjectType = {};
	const events = batch.messages
		.map((msg) => {
			try {
				const data = JSON.parse(msg.value?.toString() || "{}");

				const safeData = schema.parse(data) as AnalyticsEvent;
				const bandwidth = safeData.requestSize + safeData.responseSize;
				const projectId = safeData.projectId;
				bandwidthByProjectBatch[projectId] = (bandwidthByProjectBatch[projectId] || 0) + bandwidth;

				return {
					project_id: safeData.projectId,
					subdomain: safeData.subdomain,
					path: safeData.path,
					status_code: safeData.statusCode,
					response_time: safeData.responseTime,
					request_size: safeData.requestSize,
					response_size: safeData.responseSize,
					ip: safeData.ip,
					ua_browser: safeData.uaBrowser || null,
					ua_os: safeData.uaOs || null,
					is_mobile: safeData.isMobile ? 1 : 0,
					is_bot: safeData.isBot ? 1 : 0,
					referer: safeData.referer || null,
					timestamp: safeData.timestamp,
				} as BufferAnalytics;
			} catch (error: any) {
				console.error("Analytics parse fail, => ", error.message);
				return null;
			}
		})
		.filter(Boolean);

	try {
		await processFn({ events, bandwidthByProjectBatch }, batch.topic, "analytics");
	} catch (error) {
		console.error("Failed to process analytics batch:", error);
	}
}
