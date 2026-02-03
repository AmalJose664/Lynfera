import { AnalyticsQueryDTO } from "@/dtos/analytics.dto.js";
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
			await this.analyticsService.clearAnalytics(projectId);
			res.status(STATUS_CODES.NO_CONTENT).json({ ok: true });
		} catch (error) {
			next(error);
		}
	}
	async bandWidth(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { projectId } = req.params;
		const { range, interval, limit } = req.validatedQuery as AnalyticsQueryDTO;
		const userPlan = req.user?.plan as string;

		try {
			const [data, queryOptions] = await this.analyticsService.getBandwidthData(projectId, userPlan, {
				range: range as string,
				interval: interval as string,
			});
			const response = AnalyticsMapper.bandwidthResponseDTO(data, projectId, queryOptions);

			res.json(response);
			return;
		} catch (error) {
			next(error);
		}
	}
	async overview(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { projectId } = req.params;
		const { range, interval } = req.validatedQuery as AnalyticsQueryDTO;
		const userPlan = req.user?.plan as string;
		try {
			const [data, queryOptions] = await this.analyticsService.getOverView(projectId, userPlan, {
				range: range as string,
				interval: interval as string,
			});
			const response = AnalyticsMapper.overviewResponse(data, projectId, queryOptions);

			res.json(response);
			return;
		} catch (error) {
			next(error);
		}
	}
	async realtime(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { projectId } = req.params;
		const { interval } = req.validatedQuery as AnalyticsQueryDTO;

		try {
			const [data, queryOptions] = await this.analyticsService.getRealtime(projectId, { interval: interval as string });
			const response = AnalyticsMapper.realtimeResponse(data, projectId, queryOptions);

			res.json(response);
			return;
		} catch (error) {
			next(error);
		}
	}
	async topPages(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { projectId } = req.params;
		const { range, limit } = req.validatedQuery as AnalyticsQueryDTO;
		const userPlan = req.user?.plan as string;
		try {
			const [data, queryOptions] = await this.analyticsService.getTopPages(projectId, userPlan, {
				range: range as string,
				limit: Number(limit || 30),
			});
			const response = AnalyticsMapper.topPagesResponse(data, projectId, queryOptions);

			res.json(response);
			return;
		} catch (error) {
			next(error);
		}
	}
	async platformStats(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { projectId } = req.params;
		const { range, limit } = req.validatedQuery as AnalyticsQueryDTO;
		const userPlan = req.user?.plan as string;

		try {
			const [data, queryOptions] = await this.analyticsService.getPlatformStats(projectId, userPlan, {
				range: range as string,
				limit: Number(limit || 30),
			});
			const response = AnalyticsMapper.platformResponse(data, projectId, queryOptions);

			res.json(response);
			return;
		} catch (error) {
			next(error);
		}
	}
}

export default AnalyticsController;
