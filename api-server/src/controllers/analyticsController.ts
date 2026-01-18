import { IAnalyticsController } from "@/interfaces/controller/IAnalyticsController.js";
import { IAnalyticsService } from "@/interfaces/service/IAnalyticsService.js";
import { AnalyticsMapper } from "@/mappers/AnalyticsMapper.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { Request, Response, NextFunction } from "express";

class AnalyticsController implements IAnalyticsController {
	private analyticsService: IAnalyticsService;

	constructor(analyticsService: IAnalyticsService) {
		this.analyticsService = analyticsService;
	}
	async clearAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { projectId } = req.params;
			await this.analyticsService.clearAnalytics(projectId)
			res.status(STATUS_CODES.NO_CONTENT).json({ ok: true })
		} catch (error) {
			next(error)
		}
	}
	async bandWidth(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { projectId } = req.params;
		const { range, interval } = req.query;
		const userPlan = req.user?.plan as string;

		try {
			const [data, queryOptions] = await this.analyticsService.getBandwidthData(projectId, range as string, interval as string, userPlan);
			const response = AnalyticsMapper.bandwidthResponseDTO(data, projectId, queryOptions);

			res.json(response);
			return;
		} catch (error) {
			next(error);
		}
	}
	async overview(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { projectId } = req.params;
		const { range, interval } = req.query;
		const userPlan = req.user?.plan as string;
		try {
			const [data, queryOptions] = await this.analyticsService.getOverView(projectId, range as string, interval as string, userPlan);
			const response = AnalyticsMapper.overviewResponse(data, projectId, queryOptions);

			res.json(response);
			return;
		} catch (error) {
			next(error);
		}
	}
	async realtime(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { projectId } = req.params;
		const { interval } = req.query;

		try {
			const [data, queryOptions] = await this.analyticsService.getRealtime(projectId, interval as string);
			const response = AnalyticsMapper.realtimeResponse(data, projectId, queryOptions);

			res.json(response);
			return;
		} catch (error) {
			next(error);
		}
	}
	async topPages(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { projectId } = req.params;
		const { interval, limit } = req.query;

		try {
			const [data, queryOptions] = await this.analyticsService.getTopPages(projectId, interval as string, Number(limit || 30));
			const response = AnalyticsMapper.topPagesResponse(data, projectId, queryOptions);

			res.json(response);
			return;
		} catch (error) {
			next(error);
		}
	}
	async osStats(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { projectId } = req.params;
		const { interval } = req.query;

		try {
			const [data, queryOptions] = await this.analyticsService.getOsStats(projectId, interval as string);
			const response = AnalyticsMapper.osStatsResponse(data, projectId, queryOptions);

			res.json(response);
			return;
		} catch (error) {
			next(error);
		}
	}
}

export default AnalyticsController;
