import { PLANS } from "@/constants/plan.js";
import { IAnalyticsRepository, QueryOptions } from "@/interfaces/repository/IAnalyticsRepository.js";
import { IProjectBandwidthRepository } from "@/interfaces/repository/IProjectBandwidthRepository.js";
import { BandWidthWithProjectType, IAnalyticsService } from "@/interfaces/service/IAnalyticsService.js";
import { BufferAnalytics } from "@/models/Analytics.js";
import { fillEmptyQueries, getInterval, getRange, getUnit, validateFreeAnalyticsParams } from "@/utils/analyticsUnits.js";

class AnalyticsService implements IAnalyticsService {
	private analyticsRepo: IAnalyticsRepository;
	private projectBandwidthRepo: IProjectBandwidthRepository;

	private analyticsBuffer: BufferAnalytics[] = [];
	private readonly BATCH_SIZE = 570;
	private readonly FLUSH_INTERVAL = 6000 * 10; // 7s
	private readonly MAX_BUFFER_SIZE = 10000;
	private flushTimer?: NodeJS.Timeout;
	private isFlushing = false;

	constructor(analyticsRepo: IAnalyticsRepository, projectBandwidthRepo: IProjectBandwidthRepository) {
		this.analyticsRepo = analyticsRepo;
		this.projectBandwidthRepo = projectBandwidthRepo;
		this.startFlushTimer();
	}

	private startFlushTimer(): void {
		this.flushTimer = setInterval(() => {
			process.stdout.write(" - ");
			if (this.analyticsBuffer.length > 0) {
				this.saveBatch().catch(console.error);
			}
		}, this.FLUSH_INTERVAL);
	}
	async saveBatch(): Promise<void> {
		console.log("saving ....", this.analyticsBuffer.length);
		if (this.isFlushing || this.analyticsBuffer.length === 0) {
			console.log("returning ...");
			return;
		}

		this.isFlushing = true;
		const batch = this.analyticsBuffer.splice(0, this.BATCH_SIZE);
		try {
			await this.analyticsRepo.insertBatch(batch);
			console.log(`Saved ${batch.length} analytics `);
		} catch (error) {
			console.error("save analytics error:", error, "Discarding data");
		} finally {
			this.isFlushing = false;
		}
	}

	async addEvent(event: BufferAnalytics): Promise<void> {
		if (this.analyticsBuffer.length >= this.MAX_BUFFER_SIZE) {
			console.warn("Analytics buffer full, dropping oldest events");
			this.analyticsBuffer.splice(0, 1000);
		}
		this.analyticsBuffer.push(event);

		if (this.analyticsBuffer.length >= this.BATCH_SIZE) {
			this.saveBatch();
		}
	}
	async addEventBatch(event: BufferAnalytics[], bandwidthByProjectBatch: BandWidthWithProjectType): Promise<void> {
		if (this.analyticsBuffer.length >= this.MAX_BUFFER_SIZE) {
			console.warn("Analytics buffer full, dropping oldest events");
			this.analyticsBuffer.splice(0, 1000);
		}
		this.analyticsBuffer.push(...event);
		try {
			await this.projectBandwidthRepo.addBandwidth(bandwidthByProjectBatch);
		} catch (error) {
			console.log("Error on saving bws ,", error);
		}

		if (this.analyticsBuffer.length >= this.BATCH_SIZE) {
			this.saveBatch();
		}
	}

	async exitService(): Promise<void> {
		console.log("service cleaning....");
		clearInterval(this.flushTimer);
		while (this.analyticsBuffer.length > 0) {
			await this.saveBatch();
		}
	}
	async clearAnalytics(projectId: string): Promise<void> {
		return this.analyticsRepo.clearProjectAnalytics(projectId)
	}
	async getBandwidthData(
		projectId: string,
		range: string | undefined,
		interval: string | undefined,
		userPlan: string,
	): Promise<[unknown[], QueryOptions]> {
		const [filteredRange, fillteredInterval] = fillEmptyQueries(range, interval);

		const queryOptions = {
			interval: getInterval(fillteredInterval),
			intervalUnit: getUnit(fillteredInterval),
			range: getRange(filteredRange),
			rangeUnit: getUnit(filteredRange),
		};
		if (userPlan !== PLANS.PRO.name) {
			validateFreeAnalyticsParams(queryOptions, range, interval);
		}
		const data = await this.analyticsRepo.getBandwidth(projectId, queryOptions);
		return [data, queryOptions];
	}
	async getOverView(
		projectId: string,
		range: string | undefined,
		interval: string | undefined,
		userPlan: string,
	): Promise<[unknown[], QueryOptions]> {
		const [filteredRange, fillteredInterval] = fillEmptyQueries(range, interval);

		const queryOptions = {
			interval: getInterval(fillteredInterval),
			intervalUnit: getUnit(fillteredInterval),
			range: getRange(filteredRange),
			rangeUnit: getUnit(filteredRange),
		};
		if (userPlan !== PLANS.PRO.name) {
			validateFreeAnalyticsParams(queryOptions, range, interval);
		}
		const data = await this.analyticsRepo.getOverview(projectId, queryOptions);
		return [data, queryOptions];
	}
	async getRealtime(projectId: string, interval: string): Promise<[unknown[], QueryOptions]> {
		const queryOptions = {
			interval: getInterval(interval),
			intervalUnit: getUnit(interval),
		};
		const data = await this.analyticsRepo.getRealtime(projectId, queryOptions);
		return [data, queryOptions];
	}
	async getTopPages(projectId: string, interval: string, limit: number): Promise<[unknown[], QueryOptions]> {
		const queryOptions = {
			interval: getInterval(interval),
			intervalUnit: getUnit(interval),
			limit,
		};
		const data = await this.analyticsRepo.getTopPages(projectId, queryOptions);
		return [data, queryOptions];
	}
	async getOsStats(projectId: string, interval: string): Promise<[unknown[], QueryOptions]> {
		const queryOptions = {
			interval: getInterval(interval),
			intervalUnit: getUnit(interval),
		};
		const data = await this.analyticsRepo.getOsStats(projectId, queryOptions);
		return [data, queryOptions];
	}
}

export default AnalyticsService;
