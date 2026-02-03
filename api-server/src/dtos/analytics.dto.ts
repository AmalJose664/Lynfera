import z from "zod";

export const AnalyticsQuerySchema = z.object({
	range: z.string().optional(),
	interval: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type AnalyticsQueryDTO = z.infer<typeof AnalyticsQuerySchema>;
