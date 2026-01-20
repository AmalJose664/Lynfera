import { User } from "./User";

export enum ProjectStatus {
	NOT_STARTED = "NOT_STARTED",
	BUILDING = "BUILDING",
	QUEUED = "QUEUED",
	READY = "READY",
	FAILED = "FAILED",
	CANCELED = "CANCELLED",
}
export interface Project {
	_id: string;
	user: User | string;
	name: string;
	repoURL: string;
	subdomain: string;
	buildCommand: string;
	installCommand: string;
	branch: string;
	rootDir: string;
	outputDirectory: string;
	currentDeployment: string | null;
	tempDeployment: string | null;
	lastDeployment: string | null;
	isDisabled: boolean;
	rewriteNonFilePaths: boolean
	techStack: string;
	env: {
		name: string
		value: string
	}[];
	lastDeployedAt?: Date;
	status: string;
	deployments?: string[];
	isDeleted: boolean;

	createdAt: Date;
	updatedAt: Date;
}

export type ProjectFormInput = {
	name: string;
	repoURL: string;
	buildCommand?: string;
	installCommand?: string;
	branch?: string;
	rootDir?: string;
	outputDirectory?: string;
	env?: {
		name: string
		value: string
	}[];
}
export type ProjectSimpleStatsType = {
	totalDeployments: number,
	successRate: number,
	failureRate: number,
	failedBuilds: number,
	avgBuildTime: number,
	buildHistory: string[],
	lastDeployed: Date | null,
	bandwidth: number,
}
export type ProjectUsageResults = {
	projectId: string, deploys: number, projectName: string,
	total_build: number, isDeleted: boolean,
	bandwidthMontly: number, bandwidthTotal: number,
	month: string
}