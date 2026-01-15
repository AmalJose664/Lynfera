import { FilterQuery, Types } from "mongoose";

import { BaseRepository } from "./base/base.repository.js";
import { IProject, Project } from "@/models/Projects.js";
import { IProjectRepository } from "@/interfaces/repository/IProjectRepository.js";
import { PROJECT_POPULATE_MAP, projectUpdateFieldsString } from "@/constants/populates/project.populate.js";
import { QueryProjectDTO } from "@/dtos/project.dto.js";

class ProjectRepository extends BaseRepository<IProject> implements IProjectRepository {
	constructor() {
		super(Project);
	}

	async createProject(projectData: Partial<IProject>): Promise<IProject | null> {
		const project = new Project(projectData);
		const savedProject = await project.save();
		return savedProject;
	}
	async findProject(projectId: string, userId: string, options?: { include?: string; fields?: string[] }): Promise<IProject | null> {
		let query = Project.findOne({
			_id: projectId,
			user: userId,
			isDeleted: false,
		});

		if (options?.fields?.length) {
			query = query.select(options.fields.join(" "));
		}

		if (options?.include?.includes("user")) {
			query.populate(PROJECT_POPULATE_MAP.user.path, PROJECT_POPULATE_MAP.user.select);
		}
		if (options?.include?.includes("deployment")) {
			query.populate(PROJECT_POPULATE_MAP.deployments.path, PROJECT_POPULATE_MAP.deployments.select);
		}
		return query.exec();
	}
	async findProjectsBySubdomain(subdomain: string): Promise<IProject[]> {
		return await Project.find({ subdomain, isDeleted: false }); //
	}

	async getAllProjects(userId: string, options: QueryProjectDTO & { fields?: string[] }): Promise<{ projects: IProject[]; total: number }> {
		const dbQuery: FilterQuery<IProject> = { user: userId, isDeleted: false };
		if (options.search) {
			dbQuery.$or = [{ name: { $regex: options.search, $options: "i" } }, { subdomain: { $regex: options.search, $options: "i" } }];
		}
		if (options.status) {
			dbQuery.status = { $eq: options.status };
		}
		let findQuery = this.findMany(dbQuery)
			.limit(options.limit)
			.skip((options.page - 1) * options.limit);
		if (options?.fields?.length) {
			findQuery = findQuery.select(options.fields.join(" "));
		}
		if (options.include?.includes("user")) {
			findQuery = findQuery.populate(PROJECT_POPULATE_MAP.user.path, PROJECT_POPULATE_MAP.user.select);
		}
		if (options.include?.includes("deployment")) {
			findQuery = findQuery.populate(PROJECT_POPULATE_MAP.deployments.path, PROJECT_POPULATE_MAP.deployments.select);
		}
		const [projects, total] = await Promise.all([findQuery.sort("-createdAt").exec(), this.count(dbQuery)]);
		return { projects, total };
	}

	async deleteProject(projectId: string, userId: string): Promise<IProject | null> {
		return await Project.findOneAndUpdate({ _id: projectId, user: userId, isDeleted: false }, { isDeleted: true }, { new: true });
	}
	async updateProject(projectId: string, userId: string, updateData: Partial<IProject>): Promise<IProject | null> {
		return await Project.findOneAndUpdate(
			{ _id: projectId, user: userId },
			{ $set: { ...updateData } },
			{ new: true, select: [...projectUpdateFieldsString, "subdomain"] },
		);
	}

	async pushToDeployments(projectId: string, userId: string, newDeployment: string | Types.ObjectId): Promise<IProject | null> {
		return await Project.findOneAndUpdate(
			{ _id: projectId, user: userId },
			{
				lastDeployedAt: new Date(),
				tempDeployment: newDeployment.toString(),
				lastDeployment: newDeployment.toString(),
				$addToSet: { deployments: newDeployment },
			},
			{ new: true, select: projectUpdateFieldsString },
		);
	}

	async pullDeployments(
		projectId: string,
		userId: string,
		deployment: string | Types.ObjectId,
		backUpDeployment: string | null,
	): Promise<IProject | null> {
		return await Project.findOneAndUpdate(
			{ _id: projectId, user: userId },
			{
				currentDeployment: backUpDeployment,
				$pull: { deployments: deployment },
			},
			{ new: true, select: projectUpdateFieldsString },
		);
	}

	async __findProject(projectId: string): Promise<IProject | null> {
		// container
		return await Project.findOne({ _id: projectId });
	}
	async __updateProject(projectId: string, updateData: Partial<IProject>): Promise<IProject | null> {
		// container
		return await Project.findOneAndUpdate({ _id: projectId }, { $set: { ...updateData } }, { new: true, select: projectUpdateFieldsString });
	}
}
export default ProjectRepository;
