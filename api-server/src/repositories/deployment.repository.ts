import { FilterQuery, Types } from "mongoose";

import { BaseRepository } from "./base/base.repository.js";
import { Deployment, IDeployment } from "@/models/Deployment.js";
import { DailyDeployments, DeploymentDbOptions, IDeploymentRepository, ProjectUsageResults } from "@/interfaces/repository/IDeploymentRepository.js";
import { DEPLOYMENT_POPULATE_MAP } from "@/constants/populates/deployment.populate.js";
import { QueryDeploymentDTO } from "@/dtos/deployment.dto.js";

class DeploymentRepository extends BaseRepository<IDeployment> implements IDeploymentRepository {
	constructor() {
		super(Deployment);
	}
	async createDeployment(deploymentData: Partial<IDeployment>): Promise<IDeployment | null> {
		const deployment = new Deployment(deploymentData);
		const savedDeployment = await deployment.save();
		return savedDeployment;
	}

	async findDeploymentById(id: string, userId: string, options?: DeploymentDbOptions): Promise<IDeployment | null> {
		let dbQuery: FilterQuery<IDeployment> = { user: userId, _id: id };
		let deploymentQuery = this.findOne(dbQuery);
		const fields = options?.fields || [];
		let exclude = options?.exclude || [];
		let projection: string | undefined;

		if (fields.length) {
			projection = fields.join(" ");
		} else if (exclude.length) {
			projection = exclude.map((f) => `-${f}`).join(" ");
		}
		if (projection) {
			deploymentQuery = deploymentQuery.select(projection);
		}
		if (options?.includes?.includes("project")) {
			deploymentQuery = deploymentQuery.populate(DEPLOYMENT_POPULATE_MAP.project.path, DEPLOYMENT_POPULATE_MAP.project.select);
		}
		if (options?.includes?.includes("user")) {
			deploymentQuery = deploymentQuery.populate(DEPLOYMENT_POPULATE_MAP.user.path, DEPLOYMENT_POPULATE_MAP.user.select);
		}
		return await deploymentQuery.exec();
	}
	async findAllDeployments(
		userId: string,
		query: QueryDeploymentDTO,
		options?: DeploymentDbOptions,
	): Promise<{ deployments: IDeployment[]; total: number }> {
		let dbQuery: FilterQuery<IDeployment> = { user: userId };
		const fields = options?.fields;

		if (query.search) {
			dbQuery = { ...dbQuery, commit_hash: { $regex: query.search, $options: "i" } };
		}
		if (query.status) {
			dbQuery.status = { $eq: query.status };
		}
		let deploymentsQuery = Deployment.find(dbQuery)
			.limit(query.limit)
			.skip((query.page - 1) * query.limit);

		if (query.include?.includes("project")) {
			deploymentsQuery = deploymentsQuery.populate(DEPLOYMENT_POPULATE_MAP.project.path, DEPLOYMENT_POPULATE_MAP.project.select);
		}
		if (query.include?.includes("user")) {
			deploymentsQuery = deploymentsQuery.populate(DEPLOYMENT_POPULATE_MAP.user.path, DEPLOYMENT_POPULATE_MAP.user.select);
		}
		if (fields && fields.length) {
			deploymentsQuery = deploymentsQuery.select(fields.join(" "));
		} else {
			deploymentsQuery = deploymentsQuery.select("-file_structure");
		}
		const [deployments, total] = await Promise.all([deploymentsQuery.sort("-createdAt").exec(), this.count(dbQuery)]);

		return { deployments, total };
	}

	async findProjectDeployments(
		userId: string,
		projectId: string,
		query: QueryDeploymentDTO,
		options?: DeploymentDbOptions,
	): Promise<{ deployments: IDeployment[]; total: number }> {
		let dbQuery: FilterQuery<IDeployment> = { user: userId, project: projectId };
		const fields = options?.fields;
		if (query.search) {
			dbQuery = { ...dbQuery, commit_hash: { $regex: query.search, $options: "i" } };
		}
		if (query.status) {
			dbQuery.status = { $eq: query.status };
		}
		let deploymentsQuery = Deployment.find(dbQuery)
			.limit(query.limit)
			.skip((query.page - 1) * query.limit);
		if (query.include?.includes("project")) {
			deploymentsQuery = deploymentsQuery.populate(DEPLOYMENT_POPULATE_MAP.project.path, DEPLOYMENT_POPULATE_MAP.project.select);
		}
		if (query.include?.includes("user")) {
			deploymentsQuery = deploymentsQuery.populate(DEPLOYMENT_POPULATE_MAP.user.path, DEPLOYMENT_POPULATE_MAP.user.select);
		}
		if (fields && fields.length) {
			deploymentsQuery = deploymentsQuery.select(fields.join(" "));
		} else {
			deploymentsQuery = deploymentsQuery.select("-file_structure");
		}
		const [deployments, total] = await Promise.all([deploymentsQuery.sort("-createdAt").exec(), this.count(dbQuery)]);
		return { deployments, total };
	}

	async deleteDeployment(projectId: string, deploymentId: string, userId: string): Promise<number> {
		const result = await Deployment.deleteOne({ project: projectId, _id: deploymentId, user: userId });
		return result.deletedCount;
	}

	async getTotalBuildTime(userId: string): Promise<ProjectUsageResults[]> {
		const result = Deployment.aggregate([
			{ $match: { user: new Types.ObjectId(userId) } },
			{ $group: { _id: "$project", total_build: { $sum: "$timings.duration_ms" }, deploys: { $sum: 1 } } },
			{
				$lookup: {
					from: "projects",
					localField: "_id",
					foreignField: "_id",
					as: "project",
				},
			},
			{ $unwind: "$project" },
			{ $match: { "project.isDeleted": { $ne: true } } },
			{
				$lookup: {
					from: "projectbandwidths",
					localField: "_id",
					foreignField: "project",
					as: "bws",
				},
			},
			{ $unwind: "$bws" },
			{
				$project: {
					projectId: "$_id",
					projectName: "$project.name",
					isDeleted: "$project.isDeleted",
					total_build: 1,
					deploys: 1,
					bandwidthMontly: "$bws.bandwidthMonthly",
					bandwidthTotal: "$bws.bandwidthTotal",
					month: "$bws.currentMonth",
					_id: 0,
				},
			},
		]);
		return result;
	}
	async getDailyDeployments(userId: string, months: number): Promise<DailyDeployments[]> {
		const startDate = new Date(new Date().setMonth(new Date().getMonth() - months));
		const endDate = new Date();

		const result = Deployment.aggregate([
			{
				$match: {
					user: new Types.ObjectId(userId),
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
				},
			},
			{ $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
			{ $sort: { _id: 1 } },
		]);
		return result;
	}

	async __updateDeployment(projectId: string, deploymentId: string, updateData: Partial<IDeployment>): Promise<IDeployment | null> {
		return await Deployment.findOneAndUpdate({ project: projectId, _id: deploymentId }, { $set: updateData }, { new: true });
	}
	async __findDeployment(id: string): Promise<IDeployment | null> {
		return await Deployment.findById(id);
	}
	async __findAllProjectDeployment(projectId: string, sortOptions?: string | Record<string, 1 | -1>): Promise<IDeployment[]> {
		return await Deployment.find({ project: projectId }).sort(sortOptions || {});
	}
}
export default DeploymentRepository;
