import { IKafkaEventConsumer } from "@/interfaces/consumers/IKafkaEventConsumer.js";
import { Consumer, Kafka } from "kafkajs";
import { getAllTopics, processConumerAnalytics, processConumerLogs } from "@/events/regitry.js";

class KafkaEventConsumer implements IKafkaEventConsumer {
	private kafka: Kafka;
	private logsConsumer: Consumer;
	private analyticsConsumer: Consumer;
	private isRunning = false;

	constructor(kafka: Kafka) {
		this.kafka = kafka;
		this.logsConsumer = this.kafka.consumer({
			groupId: "lynfera-logs-group",
			sessionTimeout: 45000,
			heartbeatInterval: 3000,
		});
		this.analyticsConsumer = this.kafka.consumer({
			groupId: "lynfera-analytics-group",
			sessionTimeout: 45000,
			heartbeatInterval: 3000,
		});
	}
	async start() {
		if (this.isRunning) {
			console.log("Kafka already running");
			return;
		}
		try {
			await Promise.all([this.logsConsumer.connect(), this.analyticsConsumer.connect()]);
			console.log(" Kafka consumers connected");

			const [logsTopics, analyticsTopics] = getAllTopics();
			await this.logsConsumer.subscribe({ topics: logsTopics });
			await this.analyticsConsumer.subscribe({ topics: analyticsTopics });
			console.log(` Subscribed to topics:`, [...logsTopics, ...analyticsTopics]);

			await this.logsConsumer.run({
				autoCommit: false,
				eachBatch: processConumerLogs,
			});
			await this.analyticsConsumer.run({
				autoCommit: true,
				eachBatch: processConumerAnalytics,
			});

			this.isRunning = true;
			console.log("-------------------------------Kafka consumers started successfully-------------------------------");
		} catch (error) {
			console.error("Failed to start Kafka consumers:", error);
			throw error;
		}
	}
	async stop(): Promise<void> {
		if (!this.isRunning) {
			return;
		}

		try {
			await Promise.all([this.logsConsumer.disconnect(), this.analyticsConsumer.disconnect()]);
			this.isRunning = false;
			console.log("Kafka consumer stopped");
		} catch (error) {
			console.error("Error stopping Kafka consumer:", error);
			throw error;
		}
	}
}

export default KafkaEventConsumer;
