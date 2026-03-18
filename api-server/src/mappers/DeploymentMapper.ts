import { DeploymentTriggers, IDeployment } from "@/models/Deployment.js";
import { IUser } from "@/models/User.js";

interface toDeploymentResponseDTO {
	deployment: {
		_id: string;
		project:
			| string
			| {
					name: string;
					_id: string;
					subdomain: string;
					branch: string;
					repoURL: string;
					currentDeployment?: string;
			  };
		commit: { id: string; msg: string };
		user: string | Partial<IUser>;
		status: "NOT_STARTED" | "QUEUED" | "BUILDING" | "READY" | "FAILED" | "CANCELLED";
		environment: string;
		publicId: string;
		performance: {
			installTime: number;
			buildTime: number;
			uploadTime: number;
			totalDuration: number;
		};
		overWrite: boolean;
		completedAt: Date;
		identifierSlug: string;
		errorMessage?: string;
		triggerBy?: { username: string; login: string };
		triggerEvent?: DeploymentTriggers;
		branch: string;
		createdAt: Date;
		updatedAt: Date;
	};
}
interface toDeploymentBasicResponseDTO {
	deployment: {
		_id: string;
		project:
			| string
			| {
					name: string;
					_id: string;
					subdomain: string;
					branch: string;
					repoURL: string;
					currentDeployment?: string;
			  };
		commit: { id: string; msg: string };
		status: "NOT_STARTED" | "QUEUED" | "BUILDING" | "READY" | "FAILED" | "CANCELLED";
		publicId: string;
		identifierSlug: string;
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

interface toDeploymentsFullResponseDTO {
	deployments: toDeploymentResponseDTO["deployment"][];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}
type Options = { total: number; page: number; limit: number };
interface toDeploymentsBasicResponse {
	deployments: toDeploymentBasicResponseDTO["deployment"][];
	pagination: toDeploymentsFullResponseDTO["pagination"];
}
type ResponseType = "full" | "overview";
export class DeploymentMapper {
	static toDeployment(deployment: IDeployment, response: ResponseType): { deployment: Partial<toDeploymentResponseDTO["deployment"]> } {
		return response === "overview" ? this.toDeploymentBasicResponse(deployment) : this.toDeploymentFullResponse(deployment);
	}
	static toDeployments(
		deployments: IDeployment[],
		options: Options,
		response: ResponseType,
	): {
		deployments: Partial<toDeploymentResponseDTO["deployment"]>[];
		pagination: toDeploymentsFullResponseDTO["pagination"];
	} {
		return response === "overview" ? this.toDeploymentsBasicResponse(deployments, options) : this.toDeploymentsFullResponse(deployments, options);
	}

	static toDeploymentBasicResponse(deployment: IDeployment): toDeploymentBasicResponseDTO {
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
					: deployment.project
						? deployment.project?.toString()
						: {
								_id: "DELETED_PROJECT_" + Math.random().toString(36).slice(2, 12),
								name: "",
								subdomain: "",
								branch: "unknown",
								repoURL: "github.com/unknown/unknown",
							},
				commit: { msg: deployment.commit_hash.split("||")[1], id: deployment.commit_hash.split("||")[0] },
				status: deployment.status,
				publicId: deployment.publicId,
				identifierSlug: deployment.identifierSlug,
			},
		};
	}

	static toDeploymentFullResponse(deployment: IDeployment): toDeploymentResponseDTO {
		const commitDataSplit = deployment.commit_hash?.split("||");
		const triggerDataSplit = deployment.triggeredBy?.split("||");
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
							currentDeployment: (deployment.project as any).currentDeployment,
						}
					: deployment.project
						? deployment.project?.toString()
						: {
								_id: "DELETED_PROJECT_" + Math.random().toString(36).slice(2, 12),
								name: "",
								subdomain: "",
								branch: "unknown",
								repoURL: "github.com/unknown/unknown",
							},
				commit: { msg: commitDataSplit[1], id: commitDataSplit[0] },
				user: this.isPopulatedObject(deployment.user, ["profileImage", "email", "name"])
					? {
							name: (deployment.user as any).name,
							profileImage: (deployment.user as any).profileImage,
							email: (deployment.user as any).email,
						}
					: deployment.user.toString(),
				status: deployment.status,
				performance: {
					installTime: deployment.timings.install_ms,
					buildTime: deployment.timings.build_ms,
					uploadTime: deployment.timings.upload_ms,
					totalDuration: new Date(deployment.complete_at).getTime() - new Date(deployment.createdAt).getTime(),
				},
				environment: deployment.environment,
				publicId: deployment.publicId,
				identifierSlug: deployment.identifierSlug,
				overWrite: deployment.overWrite,
				branch: deployment.branch,
				completedAt: deployment.complete_at,
				errorMessage: deployment.error_message,
				triggerBy: { username: triggerDataSplit ? triggerDataSplit[1] : "", login: triggerDataSplit ? triggerDataSplit[0] : "" },
				triggerEvent: deployment.triggerEvent,
				createdAt: deployment.createdAt,
				updatedAt: deployment.updatedAt,
			},
		};
	}

	static toDeploymentsFullResponse(deployments: IDeployment[], options: Options): toDeploymentsFullResponseDTO {
		const { total, limit, page } = options;
		return {
			deployments: deployments.map((dep) => this.toDeploymentFullResponse(dep).deployment),
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	static toDeploymentsBasicResponse(deployments: IDeployment[], options: Options): toDeploymentsBasicResponse {
		const { total, limit, page } = options;
		return {
			deployments: deployments.map((dep) => this.toDeploymentBasicResponse(dep).deployment),
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
