import { DailyDeployments, ProjectUsageResults } from "@/interfaces/repository/IDeploymentRepository.js";
import { IProject } from "@/models/Projects.js";

interface ProjectResponseDTO {
	project: {
		_id: string;
		user: string | { _id: string; name: string; email: string; profileImage: string };
		name: string;
		repoURL: string;
		subdomain: string;
		buildCommand: string;
		installCommand: string;
		techStack: string;
		branch: string;
		rootDir: string;
		outputDirectory: string;
		currentDeployment: string | null;
		tempDeployment: string | null;
		lastDeployment: string | null;
		isDisabled: boolean;
		isDeleted: boolean;
		rewriteNonFilePaths: boolean;
		env: {
			name: string;
			value: string;
		}[];
		lastDeployedAt?: Date;
		status: "NOT_STARTED" | "QUEUED" | "BUILDING" | "READY" | "FAILED" | "CANCELLED";
		deployments?: string[];
		createdAt: Date | string;
	};
}
interface ProjectsResponseDTO {
	projects: Partial<ProjectResponseDTO["project"]>[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}
type ResponseType = "full" | "setting" | "update" | "overview";
type ProjectResponseWithUserDTO = Omit<IProject, "user"> & {
	user: any;
};
export class ProjectMapper {
	static toOverviewResponse(project: ProjectResponseWithUserDTO): { project: Partial<ProjectResponseDTO["project"]> } {
		return {
			project: {
				_id: project._id,
				name: project.name,
				branch: project.branch,
				repoURL: project.repoURL,
				techStack: project.techStack || "NA",
				status: project.status,
				currentDeployment: project.currentDeployment,
				tempDeployment: project.tempDeployment,
				lastDeployment: project.lastDeployment,
				subdomain: project.subdomain,
				user: this.isPopulatedObject(project.user, ["profileImage", "email", "name"])
					? {
						_id: project.user._id,
						name: project.user.name,
						email: project.user.email,
						profileImage: project.user.profileImage,
					}
					: project.user.toString(),
				deployments: project.deployments?.map((d) => d.toString()),
				lastDeployedAt: project.lastDeployedAt,
				createdAt: project.createdAt,
			},
		};
	}
	static toSettingsResponse(project: ProjectResponseWithUserDTO): { project: Partial<ProjectResponseDTO["project"]> } {
		return {
			project: {
				_id: project._id,
				name: project.name,
				repoURL: project.repoURL,
				branch: project.branch,
				status: project.status,
				subdomain: project.subdomain,
				user: this.isPopulatedObject(project.user, ["profileImage", "email", "name"])
					? {
						_id: project.user._id,
						name: project.user.name,
						email: project.user.email,
						profileImage: project.user.profileImage,
					}
					: project.user.toString(),
				buildCommand: project.buildCommand,
				env: project.env.map((e) => ({ name: e.name, value: e.value })),
				installCommand: project.installCommand,
				outputDirectory: project.outputDirectory,
				rootDir: project.rootDir,
				isDisabled: project.isDisabled,
				rewriteNonFilePaths: project.rewriteNonFilePaths,
				lastDeployedAt: project.lastDeployedAt,
				createdAt: project.createdAt,
			},
		};
	}
	static toUpdateResponse(project: ProjectResponseWithUserDTO): { project: Partial<ProjectResponseDTO["project"]> } {
		return {
			project: {
				_id: project._id,
				name: project.name,
			},
		};
	}
	static toFullResponse(project: ProjectResponseWithUserDTO): ProjectResponseDTO {
		return {
			project: {
				_id: project._id,
				name: project.name,
				branch: project.branch,
				buildCommand: project.buildCommand,
				env: project.env.map((e) => ({ name: e.name, value: e.value })),
				installCommand: project.installCommand,
				outputDirectory: project.outputDirectory,
				repoURL: project.repoURL,
				techStack: project.techStack || "NA",
				rootDir: project.rootDir,
				status: project.status,
				currentDeployment: project.currentDeployment,
				tempDeployment: project.tempDeployment,
				lastDeployment: project.lastDeployment,
				subdomain: project.subdomain,
				isDisabled: project.isDisabled,
				isDeleted: project.isDeleted,
				rewriteNonFilePaths: project.rewriteNonFilePaths,
				user: this.isPopulatedObject(project.user, ["profileImage", "email", "name"])
					? {
						_id: project.user._id,
						name: project.user.name,
						email: project.user.email,
						profileImage: project.user.profileImage,
					}
					: project.user.toString(),
				deployments: project.deployments?.map((d) => d.toString()),
				lastDeployedAt: project.lastDeployedAt,
				createdAt: project.createdAt,
			},
		};
	}
	static toProjectResponse(project: ProjectResponseWithUserDTO, response: ResponseType): { project: Partial<ProjectResponseDTO["project"]> } {
		if (response === "update") {
			return this.toUpdateResponse(project);
		}
		if (response === "overview") {
			return this.toOverviewResponse(project);
		}
		if (response === "setting") {
			return this.toSettingsResponse(project);
		}
		return this.toFullResponse(project);
	}
	static toProjectsResponse(projects: IProject[], total: number, page: number, limit: number, response: ResponseType): ProjectsResponseDTO {
		return {
			projects: projects.map((project) => ProjectMapper.toProjectResponse(project, response).project),
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	static toUsageMapper(projectData: ProjectUsageResults[], deploys: DailyDeployments[], months: number): {
		projects: {
			projectId: string, deploys: number, projectName: string,
			total_build: number, bandwidthMontly: number, bandwidthTotal: number,
			month: string
		}[],
		deploys: {
			_id: string,
			count: number
		}[]
	} {


		const dataMap = new Map<string, number>(deploys.map((d) => [d._id, d.count]));
		const result: { _id: string, count: number }[] = [];
		const days = months * 31;
		for (let i = days; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const dateStr = date.toISOString().split("T")[0];

			result.push({
				_id: dateStr,
				count: dataMap.get(dateStr) || 0
			})

		}
		return {
			projects: projectData.map((p) => {
				if (p.isDeleted) return null
				return {
					bandwidthMontly: Number(p.bandwidthMontly),
					bandwidthTotal: Number(p.bandwidthTotal),
					total_build: Number(p.total_build),
					projectId: p.projectId.toString(),
					projectName: p.projectName,
					deploys: Number(p.deploys),
					month: p.month
				}
			}).filter((p) => !!p),
			deploys: result
		}
	}
	static isPopulatedObject(object: any, fields: string[]): boolean {
		return object && fields.every((f) => f in object);
		// return 'name' in object && 'branch' in object;
	}
}
