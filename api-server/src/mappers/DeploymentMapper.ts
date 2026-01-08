import { Types } from "mongoose";
import { IDeployment } from "../models/Deployment.js";
import { IProject } from "../models/Projects.js";
import { IUser } from "../models/User.js";

interface toDeploymentResponseDTO {
	deployment: {
		_id: string;
		project: string | { name: string; _id: string; subdomain: string; branch: string; repoURL: string };
		commit: { id: string; msg: string };
		user: string | Partial<IUser>;
		status: "NOT_STARTED" | "QUEUED" | "BUILDING" | "READY" | "FAILED" | "CANCELLED";
		performance: {
			installTime: number;
			buildTime: number;
			totalDuration: number;
		};
		overWrite: boolean;
		completedAt: Date;
		identifierSlug: string;
		errorMessage?: string;
		createdAt: Date;
		updatedAt: Date;
	};
}
interface toDeploymentFilesResponse {
	deployment: {
		_id: string;
		fileStructure?: {
			totalSize: number;
			files: {
				name: string;
				size: number;
			}[];
		};
	};
}
interface toDeploymentsResponseDTO {
	deployments: toDeploymentResponseDTO["deployment"][];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export class DeploymentMapper {
	static toDeploymentResponse(deployment: IDeployment): toDeploymentResponseDTO {
		return {
			deployment: {
				_id: deployment._id,
				project: this.isPopulatedObject(deployment.project, ["branch", "_id", "name"])
					? {
						name: (deployment.project as any).name,
						_id: (deployment.project as any)._id,
						subdomain: (deployment.project as any).subdomain,
						branch: (deployment.project as any).branch,
						repoURL: (deployment.project as any).repoURL,
					}
					: deployment.project.toString(),
				commit: { msg: deployment.commit_hash.split("||")[1], id: deployment.commit_hash.split("||")[0] },
				user: this.isPopulatedObject(deployment.user, ["profileImage", "email", "name"])
					? {
						name: (deployment.user as any).name,
						profileImage: (deployment.user as any).profileImage,
						email: (deployment.user as any).email,
					}
					: deployment.user.toString(),
				status: deployment.status,
				performance: {
					installTime: deployment.install_ms,
					buildTime: deployment.build_ms,
					totalDuration: deployment.duration_ms,
				},
				identifierSlug: deployment.identifierSlug,
				overWrite: deployment.overWrite,
				completedAt: deployment.complete_at,
				errorMessage: deployment.error_message,
				createdAt: deployment.createdAt,
				updatedAt: deployment.updatedAt,
			},
		};
	}

	static toDeploymentsResponse(deployments: IDeployment[], total: number, page: number, limit: number): toDeploymentsResponseDTO {
		return {
			deployments: deployments.map((dep) => this.toDeploymentResponse(dep).deployment),
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	}
	static isPopulatedObject(object: any, fields: string[]): boolean {
		return object && fields.every((f) => f in object);
		// return 'name' in object && 'branch' in object;
	}
	static toDeploymentSummary(deployment: IDeployment) {
		// INCLUDE TYPES
		return {
			id: deployment._id,
			commitHash: deployment.commit_hash,
			status: deployment.status,
			createdAt: deployment.createdAt,
		};
	}
	static toDeploymentFilesResponse(deployment: IDeployment): toDeploymentFilesResponse {
		return {
			deployment: {
				_id: deployment._id,
				fileStructure: {
					totalSize: deployment.file_structure?.totalSize || 0,
					files:
						deployment.file_structure?.files.map((f) => ({
							name: f.name.replace(/\\/g, "/"),
							size: f.size,
						})) || [],
				},
			},
		};
	}
}
