import { IAnalyticsService } from "../interfaces/service/IAnalyticsService.js";
import { Producer } from "kafkajs"
import { kafka } from "../config/kafka.js";
import { IAnalytics } from "../models/Analytics.js";
import { KAFKA_ANALYTICS_TOPIC_NAME } from "../constants/topics.js";

class AnalyticsService implements IAnalyticsService {
	private kafkaProducer: Producer
	private kafkaTopic: string
	private analyticsBuffer: IAnalytics[] = []
	MAX_QUEUE_SIZE = 2000;
	BATCH_SIZE = 350;
	FLUSH_INTERVAL = 7000;    //    7s 
	isSending = false;
	FLUSH_INTERVAL_REF: ReturnType<typeof setInterval>;

	constructor(producer: Producer, topic: string) {
		this.kafkaProducer = producer
		this.kafkaTopic = topic
		this.FLUSH_INTERVAL_REF = setInterval(this.sendAnalyticsBatch.bind(this), this.FLUSH_INTERVAL);
		this.kafkaProducer.connect()
	}

	async sendAnalyticsBatch(): Promise<void> {
		process.stdout.write(" - ")
		if (this.isSending || this.analyticsBuffer.length === 0) return

		this.isSending = true;

		const batch = this.analyticsBuffer.splice(0, this.BATCH_SIZE);

		try {
			await this.kafkaProducer.send({
				topic: this.kafkaTopic,
				messages: batch.map(event => ({
					key: event.projectId,
					value: JSON.stringify(event),
					timestamp: new Date(event.timestamp).getTime().toString()
				}))
			});
			console.log(`Senting ${batch.length} analytics events...`);
		} catch (error) {
			console.error('Kafka send failed:', error);
		} finally {
			this.isSending = false;
		}
	}

	queueAnalytics(data: IAnalytics): void {
		if (this.analyticsBuffer.length >= this.MAX_QUEUE_SIZE) {
			console.warn('Analytics queue full, dropping event');
			return;
		}

		this.analyticsBuffer.push(data);

		if (this.analyticsBuffer.length >= this.BATCH_SIZE) {
			setImmediate(this.sendAnalyticsBatch.bind(this));
		}
	}

	sendAnalytics(data: IAnalytics): void {
		this.queueAnalytics(data)
	}

	async cleanService(): Promise<void> {
		while (this.analyticsBuffer.length > 0) {
			await this.sendAnalyticsBatch();
		}

		console.log("Analytics cleared\nExiting....")
		clearInterval(this.FLUSH_INTERVAL_REF)
		await this.kafkaProducer.disconnect()
		console.log("Kafka disconnected..")

	}

}

export const analyticsService = new AnalyticsService(kafka.producer(), KAFKA_ANALYTICS_TOPIC_NAME)

