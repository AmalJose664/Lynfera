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