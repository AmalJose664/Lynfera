import { Kafka } from "kafkajs"
import { randomUUID } from 'crypto';
const PROJECT_ID = '69246647869c614a349015fc'
const DEPLOYMENT_ID = "697dc843d79bd147c535419a"

const sleep = (ms) => new Promise(res => setTimeout(res, ms));


const kafkaClient = new Kafka({
	clientId: `docker-build-server-tester-${PROJECT_ID}-${DEPLOYMENT_ID}`,
	brokers: ["pkc-l7pr2.ap-south-1.aws.confluent.cloud:9092"],
	ssl: true, // or key
	sasl: {
		mechanism: "plain",
		username: process.env.KAFKA_USERNAME,
		password: process.env.KAFKA_PASSWORD,
	},
});


const producer = kafkaClient.producer();



generateDeploymentLogs(producer)
async function generateDeploymentLogs(producer) {
	await producer.connect()
	const logsCount = Math.floor(Math.random() * 5) + 10; // 10–14
	let sequence = 1;

	const send = async (topic, payload) => {
		await producer.send({
			topic,
			messages: [{ value: JSON.stringify(payload) }],
		});
	};

	/* ---------------- START UPDATE ---------------- */
	await send("deployment.updates", {
		eventId: randomUUID(),
		eventType: "DEPLOYMENT_UPDATES",
		data: {
			deploymentId: DEPLOYMENT_ID,
			projectId: PROJECT_ID,
			updateType: "START",
			updates: {
				status: "BUILDING",
			},
		}
	});
	console.log("Sleep...")
	await sleep(10000)

	/* ---------------- LOG STREAM ---------------- */
	for (let i = 0; i < logsCount; i++) {
		const logPayload = {
			eventId: randomUUID(),
			eventType: "DEPLOYMENT_LOG",
			data: {
				deploymentId: DEPLOYMENT_ID,
				projectId: PROJECT_ID,
				log: {
					level: ["INFO", "DEBUG", "WARN"][Math.floor(Math.random() * 3)],
					message: `Test log message #${sequence}`,
					timestamp: new Date().toISOString(),
					sequence,
					stream: "stdout",
				},
			},
		};

		await send("deployment.logs", logPayload);
		if (i === 4 || i === 9) {
			console.log("Middle wait")
			await sleep(10000)
		}
		sequence++;
		await sleep(300 + Math.random() * 400); // slow gap between logs
	}
	console.log("End")
	/* ---------------- END UPDATE ---------------- */
	await send("deployment.updates", {
		eventId: randomUUID(),
		eventType: "DEPLOYMENT_UPDATES",
		data: {
			deploymentId: DEPLOYMENT_ID,
			projectId: PROJECT_ID,
			updateType: "END",
			updates: {
				status: "READY",
			},
		}
	});
}