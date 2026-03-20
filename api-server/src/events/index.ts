import { kafka } from "@/config/kafka.config.js";
import KafkaEventConsumer from "@/events/consumers.js";
import { sseManager } from "./deploymentEmitter.js";
import { logsService } from "@/instances.js";

let consumersInstance: KafkaEventConsumer | null = null;

export async function startKafkaConsumer(): Promise<void> {
	consumersInstance = new KafkaEventConsumer(kafka);
	await consumersInstance.start();
	logsService.setConsumer(consumersInstance);
}

export async function stopKafkaConsumer(): Promise<void> {
	if (consumersInstance) {
		await consumersInstance.stop();
	}
	sseManager.cleanup();
}
