import z from "zod";
import { EventTypes, UpdateTypes } from "@/events/types/event.js";
import { mongoIdSchema } from "@/dtos/zodHelpers.js";
import { DeploymentStatus } from "@/models/Deployment.js";


export const DeploymentLogEventSchema = z.object({
	eventId: z.uuidv4(),
	eventType: z.enum(Object.values(EventTypes)),
	data: z.object({
		deploymentId: mongoIdSchema,
		projectId: mongoIdSchema,
		log: z.object({
			level: z.string(),
			message: z.string(),
			timestamp: z.iso.datetime(),
			sequence: z.number().optional(), // for precise ordering of logs. timestamp alone is not accurate
			stream: z.string().optional(),
		}),
	}),
});
const filesArraySchema = z
	.object({
		name: z.string(),
		size: z.number().default(0),
	})
	.array();
export const DeploymentUpdatesEventSchema = z.object({
	eventId: z.uuidv4(),
	eventType: z.enum(Object.values(EventTypes)),
	data: z.object({
		deploymentId: mongoIdSchema,
		projectId: mongoIdSchema,
		updateType: z.enum(Object.values(UpdateTypes)),
		updates: z.object({
			status: z.enum(Object.values(DeploymentStatus)).optional(),
			techStack: z.string().optional(),
			commit_hash: z.string().optional(),
			error_message: z.string().optional(),
			install_ms: z.number().optional(),
			build_ms: z.number().optional(),
			upload_ms: z.number().optional(),
			duration_ms: z.number().optional(),
			complete_at: z.iso.datetime().optional(),
			file_structure: z
				.object({
					totalSize: z.number().default(0),
					files: filesArraySchema,
				})
				.optional(),
		}),
	}),
});
export type DeploymentLogEvent = z.infer<typeof DeploymentLogEventSchema>;
export type DeploymentUpdatesEvent = z.infer<typeof DeploymentUpdatesEventSchema>;
