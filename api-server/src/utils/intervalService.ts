import { IAnalyticsService } from "@/interfaces/service/IAnalyticsService.js";
import { ILogsService } from "@/interfaces/service/ILogsService.js";

class IntervalManager {
	private flushTimer?: NodeJS.Timeout;
	private readonly FLUSH_INTERVAL = 1000 * 10; // 10 seconds

	private analyticsService: IAnalyticsService;
	private logsService: ILogsService;
	constructor(logsSvcs: ILogsService, analyticsSvsc: IAnalyticsService) {
		this.analyticsService = analyticsSvsc;
		this.logsService = logsSvcs;
		this.startFlushTimer();
	}
	private startFlushTimer(): void {
		this.flushTimer = setInterval(async () => {
			process.stdout.write(" -");
			await this.flushAll();
		}, this.FLUSH_INTERVAL);
	}

	private async flushAll(): Promise<void> {
		await Promise.allSettled([this.analyticsService.saveBatch(), this.logsService.saveBatch()]);
	}

	async exitService(): Promise<void> {
		clearInterval(this.flushTimer);
		await Promise.allSettled([this.analyticsService.exitService(), this.logsService.exitService()]);
	}
}

export default IntervalManager;
