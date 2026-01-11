import { Kafka } from "kafkajs";

export const kafka = new Kafka({
	clientId: `api-server`,
	brokers: ["pkc-l7pr2.ap-south-1.aws.confluent.cloud:9092"],
	ssl: true,
	sasl: {
		mechanism: "plain",
		username: process.env.KAFKA_USERNAME as string,
		password: process.env.KAFKA_PASSWORD as string,
	},
	retry: {
		retries: 8,
		restartOnFailure: async () => {
			process.stdout.write("   ---- kafka retry ----   ")
			return true
		}
	}
});
