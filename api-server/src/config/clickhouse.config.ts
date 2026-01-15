import { createClient } from "@clickhouse/client";
import { ENVS } from "@/config/env.config.js";

export const client = createClient({
	url: ENVS.CLICKHOUSE_HOST_URL_WITH_PORT as string,
	//https://wsjhizz301.ap-south-1.aws.clickhouse.cloud:8443
	username: ENVS.CLICKHOUSE_USERNAME as string,
	password: ENVS.CLICKHOUSE_PASSWORD as string,
	compression: {
		request: true,
		response: true,
	},
	max_open_connections: 10,
});
