import z from "zod";
import { mongoIdSchema } from "./zodHelpers.js";
import { DeploymentStatus } from "../models/Deployment.js";

export const CreateDeploymentSchema = z.object({
	projectId: mongoIdSchema,
});
export const DeploymentQueryScheme = z
	.object({
		status: z.enum(Object.values(DeploymentStatus)).optional(),
		page: z.coerce.number().int().positive().default(1),
		limit: z.coerce.number().int().min(1).max(100).default(10),
		search: z.string().max(100).default("").optional(),
		include: z.string().optional(),
		full: z.string().optional()
	})
	.strict();

export type CreateDeploymentDTO = z.infer<typeof CreateDeploymentSchema>;
export type QueryDeploymentDTO = z.infer<typeof DeploymentQueryScheme>;
