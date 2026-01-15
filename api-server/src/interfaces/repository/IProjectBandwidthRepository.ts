import { IProject } from "@/models/Projects.js";
import { BandWidthWithProjectType } from "../service/IAnalyticsService.js";

export interface IProjectBandwidthRepository {
	addBandwidth(projectWithSize: BandWidthWithProjectType): Promise<void>;
	addProjectField(project: IProject): Promise<void>;
	getUserMonthlyBandwidth(userId: string): Promise<number>;
	getProjectMonthlyBandwidth(projectId: string, userId: string): Promise<number>;
	getUserTotalBandwidth(userId: string): Promise<number>;
	getProjectTotalBandwidth(projectId: string, userId: string): Promise<number>;
}
