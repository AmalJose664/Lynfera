import z from "zod";

export const analyticsEventSchema = z
	.object({
		projectId: z.string(),
		path: z.string(),
		statusCode: z.number(),
		responseTime: z.number(),
		responseSize: z.number(),
		ip: z.string(),
		uaBrowser: z.string().optional(),
		uaOs: z.string().optional(),
		referer: z.string().optional(),
		timestamp: z.number(),
	})
	.strict();

export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
