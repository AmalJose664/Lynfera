import { IProjectBandwiths, ProjectBandwidth } from "@/models/ProjectBandwidths.js";
import { Types } from "mongoose";
import { BaseRepository } from "./base/base.repository.js";
import { IProjectBandwidthRepository } from "@/interfaces/repository/IProjectBandwidthRepository.js";
import { IProject } from "@/models/Projects.js";
import { BandWidthWithProjectType } from "@/interfaces/service/IAnalyticsService.js";

class ProjectBandwidthRepository extends BaseRepository<IProjectBandwiths> implements IProjectBandwidthRepository {
	constructor() {
		super(ProjectBandwidth);
	}

	async addProjectField(project: IProject): Promise<void> {
		this.create({ project: project._id as any, user: project.user });
	}
	async addBandwidth(projectWithSize: BandWidthWithProjectType): Promise<void> {
		const currentMonth = new Date().toISOString().slice(0, 7);
		const bulkUpdates = Object.entries(projectWithSize).map(([projectId, bandwidth]) => ({
			updateOne: {
				filter: { project: projectId },
				update: [
					{
						$set: {
							bandwidthMonthly: {
								$cond: {
									if: { $ne: ["$currentMonth", currentMonth] },
									then: bandwidth,
									else: { $add: ["$bandwidthMonthly", bandwidth] },
								},
							},
							currentMonth: currentMonth,
							bandwidthTotal: { $add: ["$bandwidthTotal", bandwidth] },
						},
					},
				],
				upsert: true,
			},
		}));
		await ProjectBandwidth.bulkWrite(bulkUpdates);
	}
	private async sumMonthlyBandwidth(filter: Record<string, any>): Promise<number> {
		const currentMonth = new Date().toISOString().slice(0, 7);

		const result = await ProjectBandwidth.aggregate([
			{ $match: { ...filter, currentMonth } },
			{ $group: { _id: null, total: { $sum: "$bandwidthMonthly" } } },
		]);

		return result[0]?.total ?? 0;
	}
	private async sumTotalBandwidth(filter: Record<string, any>): Promise<number> {
		const currentMonth = new Date().toISOString().slice(0, 7);

		const result = await ProjectBandwidth.aggregate([
			{ $match: { ...filter, currentMonth } },
			{ $group: { _id: null, total: { $sum: "$bandwidthTotal" } } },
		]);

		return result[0]?.total ?? 0;
	}
	async getUserMonthlyBandwidth(userId: string): Promise<number> {
		return this.sumMonthlyBandwidth({ user: new Types.ObjectId(userId) });
	}

	async getProjectMonthlyBandwidth(projectId: string, userId: string): Promise<number> {
		return this.sumMonthlyBandwidth({
			user: new Types.ObjectId(userId),
			project: new Types.ObjectId(projectId),
		});
	}
	async getUserTotalBandwidth(userId: string): Promise<number> {
		return this.sumTotalBandwidth({ user: new Types.ObjectId(userId) });
	}

	async getProjectTotalBandwidth(projectId: string, userId: string): Promise<number> {
		return this.sumTotalBandwidth({
			user: new Types.ObjectId(userId),
			project: new Types.ObjectId(projectId),
		});
	}
}
export default ProjectBandwidthRepository;
