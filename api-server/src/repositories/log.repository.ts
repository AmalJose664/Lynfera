import { v4 as uuidV4 } from "uuid";
import { ILogRepository, LogModel } from "../interfaces/repository/ILogRepository.js";
import { ClickHouseClient, ResponseJSON } from "@clickhouse/client";

class LogRepository implements ILogRepository {
	private client: ClickHouseClient;
	constructor(client: ClickHouseClient) {
		this.client = client;
	}

	async getProjectLogs(projectId: string, page: number = 1, limit: number = 100): Promise<ResponseJSON<unknown>> {
		const offset = (page - 1) * limit;
		const result = await this.client.query({
			query: `SELECT *, toTimeZone(report_time, 'Asia/Kolkata') as report_time, count() OVER () AS total FROM log_events WHERE project_id={project_id:String} ORDER BY "report_time" ASC LIMIT {limit:UInt32} OFFSET {offset:UInt32}`,
			query_params: {
				project_id: projectId,
				limit: limit > 1000 ? 1000 : limit,
				offset,
			},
			format: "JSON",
		});

		return await result.json();
	}

	async getLogs(deploymentId: string, page: number = 1, limit: number = 100): Promise<ResponseJSON<unknown>> {
		const offset = (page - 1) * limit;
		const result = await this.client.query({
			query: `SELECT *, toTimeZone(report_time, 'Asia/Kolkata') as report_time FROM log_events WHERE deployment_id={deployment_id:String} ORDER BY report_time ASC, sequence ASC`,
			query_params: {
				deployment_id: deploymentId,
				limit,
				offset,
			},
			format: "JSON",
		});
		return await result.json();
	}

	async __insertLogs(data: LogModel): Promise<void> {
		await this.client.insert({
			table: "log_events",
			values: [
				{
					event_id: uuidV4(),
					info: data.info,
					deployment_id: data.deploymentId,
					project_id: data.projectId,
					log: data.log,
					report_time: data.reportTime.getTime(),
					sequence: data.sequence
				},
			],
			format: "JSONEachRow",
		});
	}
}
export default LogRepository;
