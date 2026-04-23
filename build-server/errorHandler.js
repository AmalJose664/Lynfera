/**
 * @file errorHandler.js
 * @description Fallback error reporter for the build server container.
 *
 * This script is executed by the Docker container's CMD or a shell wrapper
 * when the main builder process (builder.js) fails to start, crashes before
 * it can connect to Kafka, or exceeds the container's hard timeout.
 *
 * In those situations builder.js cannot publish its own failure update, so
 * this script acts as a last-resort reporter: it connects to Kafka with its
 * own producer, sends a single DEPLOYMENT_UPDATES message with status=FAILED,
 * then exits.
 *
 * Environment variables required (injected by the API server):
 *   - PROJECT_ID    – MongoDB ObjectId of the project.
 *   - DEPLOYMENT_ID – MongoDB ObjectId of the deployment.
 *   - KAFKA_USERNAME – Kafka SASL username.
 *   - KAFKA_PASSWORD – Kafka SASL password.
 *
 * Note: This file uses CommonJS (require) because it may be invoked in
 * contexts where ESM is not available or the module type is not set.
 */

const { Kafka } = require('kafkajs');
const { randomUUID } = require('crypto');


const projectId = process.env.PROJECT_ID;
const deploymentId = process.env.DEPLOYMENT_ID;
const kafka = new Kafka({
	clientId: `build-server-error-handler-${projectId}-${deploymentId}`,
	brokers: ["pkc-l7pr2.ap-south-1.aws.confluent.cloud:9092"],
	ssl: true,
	sasl: {
		username: process.env.KAFKA_USERNAME,
		password: process.env.KAFKA_PASSWORD,
		mechanism: "plain"
	},
});

const producer = kafka.producer();


/**
 * Connects to Kafka and publishes a single FAILED deployment update, then
 * disconnects and exits with code 0.
 *
 * Exits with code 1 if PROJECT_ID or DEPLOYMENT_ID are missing, or if the
 * Kafka send fails.
 */
async function handleActionsFailure() {
	if (!projectId || !deploymentId) {
		console.error("Ids not received")
		process.exit(1)
	}
	console.log("Starting exec ")
	await producer.connect()
	console.log("Producer connected")
	await producer.send({
		topic: "deployment.updates", messages: [
			{
				key: "log", value: JSON.stringify(
					{
						eventId: randomUUID(),
						eventType: 'DEPLOYMENT_UPDATES',
						data: {
							deploymentId: deploymentId,
							projectId: projectId,
							updateType: "ERROR",
							updates: {
								status: "FAILED",
								error_message: "Failed to start build runner / Build timeout exceeded",
							}
						}
					}
				)
			}
		]
	})
	console.log("Message sent")
	console.log("------------")
	await producer.disconnect()
}
handleActionsFailure().then(() => {
	process.exit(0)
}).catch((e) => {
	console.log(e, "Failed to send erros")
	process.exit(1)
})