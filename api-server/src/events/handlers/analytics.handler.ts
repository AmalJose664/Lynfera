import { analyticsService } from "@/instances.js";
import { BandWidthWithProjectType } from "@/interfaces/service/IAnalyticsService.js";
import { BufferAnalytics } from "@/models/Analytics.js";
export type BatchAnalyticsType = {
	events: BufferAnalytics[];
	bandwidthByProjectBatch: BandWidthWithProjectType;
};
class ProjectAnalyticsHandler {
	static handleDataBatch(data: BatchAnalyticsType, dummy: boolean) {
		analyticsService.addEventBatch(data.events, data.bandwidthByProjectBatch);
	}
	static async handleDataSinlge(data: BufferAnalytics) {
		analyticsService.addEvent(data);
	}
}

export default ProjectAnalyticsHandler;
