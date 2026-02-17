import { Model } from "mongoose";
import { IProjectRepo } from "../interfaces/repository/IProjectRepo.js";
import { IProject, Project } from "../models/Project.js";

class ProjectRepository implements IProjectRepo {
	private model: Model<IProject>
	constructor(projectModel: Model<IProject>) {
		this.model = projectModel
	}

	async getProjectBySlug(slug: string): Promise<IProject | null> {
		return await this.model.findOne(
			{ subdomain: slug },
			{
				subdomain: 1,
				_id: 1,
				isDeleted: 1,
				isDisabled: 1,
				status: 1,
				currentDeployment: 1,
				tempDeployment: 1,
				rewriteNonFilePaths: 1
			}
		)
	}
	async getProjectBySlugWithUser(slug: string): Promise<IProject | null> {
		return await this.model.findOne(
			{ subdomain: slug },
			{
				subdomain: 1,
				_id: 1,
				isDeleted: 1,
				isDisabled: 1,
				status: 1,
				currentDeployment: 1,
				tempDeployment: 1,
				rewriteNonFilePaths: 1,
				user: 1
			}
		).populate("user", "plan")
	}
}



export const projectRepo = new ProjectRepository(Project)