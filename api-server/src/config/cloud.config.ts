import { ECSClient } from "@aws-sdk/client-ecs";
import { S3Client } from "@aws-sdk/client-s3";
import { ENVS } from "@/config/env.config.js";

export const ecsClient = new ECSClient({
	region: "us-east-1",
	credentials: {
		accessKeyId: ENVS.CLOUD_ACCESSKEY as string,
		secretAccessKey: ENVS.CLOUD_SECRETKEY as string,
	},
});

export const s3Client = new S3Client({
	region: "auto",
	credentials: {
		accessKeyId: ENVS.CLOUD_ACCESSKEY as string,
		secretAccessKey: ENVS.CLOUD_SECRETKEY as string,
	},
	endpoint: ENVS.CLOUD_ENDPOINT,
	forcePathStyle: true,
});

export const config = {
	CLUSTER: ENVS.CLUSTER_ARN as string,
	TASK: ENVS.TASK_ARN as string,
};
