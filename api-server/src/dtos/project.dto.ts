import z from "zod";


import { mongoIdSchema } from "@/dtos/zodHelpers.js";
import { ProjectStatus } from "@/models/Projects.js";
import { DEPLOYMENT_ID_LENGTH, DEPLOYMENT_SEPARATOR_LENGTH, MAX_SUBDOMAIN_LENGTH } from "@/constants/subdomain.js";



export const envSchema = z
	.object({
		name: z
			.string()
			.min(1, "Name is required")
			.max(100, "Name too long")
			.regex(/^[A-Z_][A-Z0-9_]*$/, "Name must be uppercase with underscores"),
		value: z.string().max(5000, "Value too long"),
	})
	.strict();

export const CreateProjectSchema = z.object({
	name: z
		.string()
		.min(3, "Name should be at least 3 charecters")
		.min(3, "Name should not exceed 3 charecters")
		.regex(/^[a-z0-9-]+$/, "Project name can only contain lowercase letters, numbers, and hyphens")
		.refine((name) => !name.startsWith("-") && !name.endsWith("-"), "Project name cannot start or end with hyphen"),
	repoURL: z
		.string()
		.regex(/^(?:https?:\/\/(?:www\.)?github\.com\/)?[\w-]+\/[\w.-]+\/?$/, "Invalid repository format (expected: owner/repo or full GitHub URL)"),
	branch: z.string().min(1, "Branch cannot be empty").default("main").optional(),
	buildCommand: z
		.string()
		.regex(/^[a-zA-Z0-9_\-./ ]+$/, "Build command contains invalid characters")
		.optional()
		.default("build"),
	// installCommand: z
	// 	.string()
	// 	.regex(/^[a-zA-Z0-9_\-./ ]+$/, "Install command contains invalid characters")
	// 	.optional()
	// 	.default("install"),
	rootDir: z
		.string()
		.trim()
		.min(1, "Root directory cannot be empty")
		.regex(
			/^\/(?!\.\.)[a-zA-Z0-9\/_-]*$/,
			"Path must start with / and contain only alphanumeric characters, hyphens, underscores, and forward slashes",
		)
		.refine(
			(path) => !path.includes("..") && !["/etc", "/root", "/sys", "/proc", "/dev"].some((dir) => path.startsWith(dir)),
			"Invalid or restricted path",
		)
		.default("/")
		.catch("/")
		.optional(),
	outputDirectory: z.string().optional().default("dist"),
	env: z.array(envSchema).max(100).default([]).optional(),
});

export const UpdateProjectSchema = z.object({
	name: z
		.string()
		.min(3, "Name should be at least 3 charecters")
		.min(3, "Name should not exceed 3 charecters")
		.regex(/^[a-z0-9-]+$/, "Project name can only contain lowercase letters, numbers, and hyphens")
		.refine((name) => !name.startsWith("-") && !name.endsWith("-"), "Project name cannot start or end with hyphen")
		.optional(),
	branch: z.string().optional(),
	buildCommand: z
		.string()
		.regex(/^[a-zA-Z0-9_\-./ ]+$/, "Build command contains invalid characters")
		.optional(),
	installCommand: z
		.string()
		.regex(/^[a-zA-Z0-9_\-./ ]+$/, "Install command contains invalid characters")
		.optional(),
	rootDir: z
		.string()
		.trim()
		.min(1, "Root directory cannot be empty")
		.regex(
			/^\/(?!\.\.)[a-zA-Z0-9\/_-]*$/,
			"Path must start with / and contain only alphanumeric characters, hyphens, underscores, and forward slashes",
		)
		.refine(
			(path) => !path.includes("..") && !["/etc", "/root", "/sys", "/proc", "/dev"].some((dir) => path.startsWith(dir)),
			"Invalid or restricted path",
		)
		.catch("/")
		.optional(),
	rewriteNonFilePaths: z.boolean().optional(),
	outputDirectory: z.string().optional(),
	env: z.array(envSchema).max(100).optional(),
	isDisabled: z.boolean().optional(),
	projectId: z.string(),
});

export const ProjectQuerySchema = z
	.object({
		status: z.enum(Object.values(ProjectStatus)).optional(),
		page: z.coerce.number().int().positive().default(1),
		limit: z.coerce.number().int().min(1).max(100).default(10),
		search: z.string().max(100).optional().default(""),
		include: z.string().optional(),
		full: z.string().optional()
	})
	.strict();

export const ProjectSubdomainSchema = z.object({
	projectId: mongoIdSchema,
	newSubdomain: z
		.string()
		.min(3)
		.max(MAX_SUBDOMAIN_LENGTH - (DEPLOYMENT_ID_LENGTH + DEPLOYMENT_SEPARATOR_LENGTH))
		.regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens allowed")
		.regex(/^[a-z0-9]/, "Must start with a letter or number")
		.regex(/[a-z0-9]$/, "Must end with a letter or number"),
});
export const SubdomainQuerySchema = z.object({
	value: z
		.string()
		.min(7)
		.max(MAX_SUBDOMAIN_LENGTH - (DEPLOYMENT_ID_LENGTH + DEPLOYMENT_SEPARATOR_LENGTH))
		.regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens allowed")
		.regex(/^[a-z0-9]/, "Must start with a letter or number")
		.regex(/[a-z0-9]$/, "Must end with a letter or number"),
});
export const ProjectDeploymentUpdateSchema = z.object({
	newCurrentDeployment: mongoIdSchema,
});

export type CreateProjectDTO = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectDTO = z.infer<typeof UpdateProjectSchema>;
export type QueryProjectDTO = z.infer<typeof ProjectQuerySchema>;
export type UpdateSubdomainDTO = z.infer<typeof ProjectSubdomainSchema>;
export type checkSubdomainDTO = z.infer<typeof SubdomainQuerySchema>;
export type ProjectDeploymentUpdateDTO = z.infer<typeof ProjectDeploymentUpdateSchema>;
