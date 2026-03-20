import { ZodError } from "zod";
import { EachBatchPayload, Offsets } from "kafkajs";

import { EventConfig } from "@/events/types/event.js";
import {
	DeploymentLogEvent,
	DeploymentLogEventSchema,
	DeploymentUpdatesEvent,
	DeploymentUpdatesEventSchema,
} from "@/events/schemas/deployment.schema.js";
import DeploymentEventHandler from "@/events/handlers/deployment.handler.js";
import ProjectAnalyticsHandler, { BatchAnalyticsType } from "@/events/handlers/analytics.handler.js";
import { AnalyticsEvent, analyticsEventSchema } from "@/events/schemas/analytics.schema.js";
import { BandWidthWithProjectType } from "@/interfaces/service/IAnalyticsService.js";
import { BufferAnalytics } from "@/models/Analytics.js";
import { LogModel } from "@/interfaces/repository/ILogRepository.js";
import { ILogs } from "@/models/Logs.js";

export const EVENT_REGISTRY = {
	logs: {
		"deployment.logs": {
			mode: "batch",
			topic: "deployment.logs", // <------- Actual kafka topic name
			handler: DeploymentEventHandler.handleLogsBatch,
			schema: DeploymentLogEventSchema,
			processFn: DeploymentEventHandler.handlerMessageEmitting,
			consumer: consumerLogsMessages,
		},
		"deployment.updates": {
			mode: "single",
			topic: "deployment.updates", // <------- Actual kafka topic name
			handler: DeploymentEventHandler.handleUpdates,
			processFn: processLogUpdates,
			schema: DeploymentUpdatesEventSchema,
			consumer: consumerLogsUpdates,
		},
	},
	analytics: {
		"project.analytics": {
			mode: "batch",
			topic: "project.analytics", // <------- Actual kafka topic name
			handler: ProjectAnalyticsHandler.handleDataBatch,
			schema: analyticsEventSchema,
			consumer: consumerAnalyticsProjects,
		},
	},
};

const KAFKA_MESSAGE_SAVE_RETRIES = 3;
const KAFKA_MESSAGE_RETRY_INITIAL_DELAY = 750;

export function getConfigByTopic<T, T2>(topic: string): EventConfig<T, T2> | undefined {
	for (const group of Object.values(EVENT_REGISTRY)) {
		for (const config of Object.values(group)) {
			if (config.topic === topic) return config;
		}
	}
	return undefined;
}

export function getDeploymentLogsTopic() {
	return EVENT_REGISTRY.logs["deployment.logs"].topic;
}
export function getAllTopics() {
	return Object.values(EVENT_REGISTRY).map((types) => Object.values(types).map((field) => field.topic));
}

export async function processLogUpdates(
	data: unknown,
	config: EventConfig<ReturnType<typeof DeploymentEventHandler.handleUpdates>, DeploymentUpdatesEvent>,
) {
	let attempt = 0;
	let processed = false;

	while (!processed && attempt < KAFKA_MESSAGE_SAVE_RETRIES) {
		try {
			const parsedData = config.schema.parse(data) as DeploymentUpdatesEvent;
			parsedData;
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
				console.log("Delay taken - ", delay);
			} else {
				console.log("Max retries reached skipping message");
				throw error;
			}
		}
	}
}

async function consumerLogsUpdates(
	{ batch, resolveOffset, heartbeat, commitOffsetsIfNecessary }: EachBatchPayload,
	rawConfig: EventConfig<any, any>,
) {
	const config = rawConfig as EventConfig<ReturnType<typeof DeploymentEventHandler.handleUpdates>, DeploymentUpdatesEvent>;
	let lastOffset = null;
	for (const msg of batch.messages) {
		try {
			const data = JSON.parse(msg.value?.toString() as any);

			await config.processFn(data, config);
			resolveOffset(msg.offset);
			lastOffset = msg.offset;
		} catch (error: any) {
			console.error("Failed to process message:", error); // send to dlq task-------, Not best to discard the data, Use dlqs for error handling
			resolveOffset(msg.offset);
			lastOffset = msg.offset;
		}
	}
	lastOffset && commitOffsetsIfNecessary(lastOffset as unknown as Offsets);
	await heartbeat();
}

async function consumerLogsMessages(
	{ batch, resolveOffset, heartbeat, commitOffsetsIfNecessary }: EachBatchPayload,
	rawConfig: EventConfig<any, any>,
) {
	const config = rawConfig as EventConfig<ReturnType<typeof DeploymentEventHandler.handleLogsBatch>, ILogs[]>;
	const logsCollectedFromBatch: ILogs[] = [];
	let index = 0;
	for (const msg of batch.messages) {
		try {
			const data = JSON.parse(msg.value?.toString() as any);

			const parsedData = config.schema.parse(data) as DeploymentLogEvent;

			const mappedData: ILogs = {
				deployment_id: parsedData.data.deploymentId,
				project_id: parsedData.data.projectId,
				event_id: parsedData.eventId,
				log: parsedData.data.log.message,
				info: parsedData.data.log.level,
				report_time: new Date(parsedData.data.log.timestamp).getTime(),
				sequence: parsedData.data.log.sequence || 0,
			};

			logsCollectedFromBatch.push(mappedData);
			if (index % 50 === 0) await heartbeat();
			config.processFn(parsedData, config);
			resolveOffset(msg.offset);
		} catch (error: any) {
			console.error("Failed to process message:", error); // send to dlq task-------
			resolveOffset(msg.offset);
		}
		index += 1;
	}

	config.handler(logsCollectedFromBatch, false);
	commitOffsetsIfNecessary();
	await heartbeat();
}

function consumerAnalyticsProjects({ batch }: EachBatchPayload, rawConfig: EventConfig<any, any>) {
	const config = rawConfig as EventConfig<ReturnType<typeof ProjectAnalyticsHandler.handleDataBatch>, BatchAnalyticsType>;
	process.stdout.write(" ** ->" + batch.messages.length);

	const schema = config.schema;
	const bandwidthByProjectBatch: BandWidthWithProjectType = {};
	const events = batch.messages
		.map((msg) => {
			try {
				const data = JSON.parse(msg.value?.toString() || "{}");

				const safeData = schema.parse(data) as AnalyticsEvent;
				const bandwidth = 100 + safeData.responseSize;
				const projectId = safeData.projectId;
				bandwidthByProjectBatch[projectId] = (bandwidthByProjectBatch[projectId] || 0) + bandwidth;

				return {
					project_id: safeData.projectId,
					path: safeData.path,
					status_code: safeData.statusCode,
					response_time: safeData.responseTime,
					response_size: safeData.responseSize,
					ip: safeData.ip,
					ua_browser: safeData.uaBrowser || null,
					ua_os: safeData.uaOs || null,
					referer: safeData.referer || null,
					timestamp: safeData.timestamp,
				} as BufferAnalytics;
			} catch (error: any) {
				console.error("Analytics parse fail, => ", error.message);
				return null;
			}
		})
		.filter(Boolean) as BatchAnalyticsType["events"];
	try {
		config.handler({ events, bandwidthByProjectBatch }, false);
	} catch (error) {
		console.error("Failed to process analytics batch:", error);
	}
}

export default async function universalKafkaHandler(payload: EachBatchPayload) {
	const topic = payload.batch.topic;
	const config = getConfigByTopic<any, any>(topic);

	if (!config) {
		console.warn(`No handler registered for topic: ${topic}. Skipping batch.`);
		return;
	}
	await config.consumer(payload, config);
}
