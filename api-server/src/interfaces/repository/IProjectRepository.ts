import { QueryProjectDTO } from "@/dtos/project.dto.js";
import { IProject } from "@/models/Projects.js";
import { Types } from "mongoose";

export interface IProjectRepository {
	createProject(project: Partial<IProject>): Promise<IProject | null>;

	getAllProjects(userId: string, query: QueryProjectDTO & { fields?: string[] }): Promise<{ projects: IProject[]; total: number }>;
	findProject(projectId: string, userId: string, options?: { include?: string; fields?: string[] }): Promise<IProject | null>;
	findProjectsBySubdomain(subdomain: string): Promise<IProject[]>;
	deleteProject(projectId: string, userId: string): Promise<IProject | null>;

	checkProjectExistBySubdomain(subdomain: string): Promise<{ _id: string } | null>;

	updateProject(projectId: string, userId: string, updateData: Partial<IProject>): Promise<IProject | null>;
	pushToDeployments(prjectId: string, userId: string, newDeployment: string | Types.ObjectId): Promise<IProject | null>;
	pullDeployments(
		projectId: string,
		userId: string,
		newDeployment: string | Types.ObjectId,
		backUpDeployment: string | null,
	): Promise<IProject | null>;

	__findProject(projectId: string): Promise<IProject | null>;
	__updateProject(projectId: string, updateData: Partial<IProject>): Promise<IProject | null>;
}
