import { kafka } from "@/config/kafka.config.js";
import KafkaEventConsumer from "@/events/consumers.js";

let consumersInstance: KafkaEventConsumer | null = null;

export async function startKafkaConsumer(): Promise<void> {
	consumersInstance = new KafkaEventConsumer(kafka);
	await consumersInstance.start();
}

export async function stopKafkaConsumer(): Promise<void> {
	if (consumersInstance) {
		await consumersInstance.stop();
	}
}
