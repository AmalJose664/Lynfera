import "dotenv/config";
import { Kafka } from "kafkajs";
import { Deployment } from "./src/models/Deployment";
import { Project } from "./src/models/Projects";
import P_repo from "./src/repositories/project.repository";
import D_repo from "./src/repositories/deployment.repository";
import AnalyticsRepo from "./src/repositories/analytics.repository";
import mongoose, { Types } from "mongoose";
import connectDb from "./src/config/mongo.config";
import { User } from "./src/models/User";
import { client } from "./src/config/clickhouse.config";
import { generateSlug } from "random-word-slugs";
import { nanoid } from "./src/utils/generateNanoid";
import crypto from "crypto";
import { OtpModel } from "./src/models/Otp";
import { v4 as uuidV4 } from "uuid";
function formatTimeWithSeconds(input: Date | string | number): string {
	const date = input instanceof Date ? input : new Date(input);

	if (isNaN(date.getTime())) {
		throw new Error("Invalid date input");
	}

	let hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
	const ampm = hours >= 12 ? "PM" : "AM";

	hours = hours % 12 || 12; // Convert 0–23 → 1–12 range

	// Pad with leading zeros
	const hh = String(hours).padStart(2, "0");
	const mm = String(minutes).padStart(2, "0");
	const ss = String(seconds).padStart(2, "0");

	return `${hh}:${mm}:${ss} ${ampm}`;
}

console.log("--------------------------------------------------------------------------------------------------------------");
async function mongodbData() {
	try {
		await connectDb();

		const p = new P_repo();
		const de = new D_repo();

		// const obj = new OtpModel({ userId: "68c8d40ce28583b09f575555", otpHash: "heysuuu", expiresAt: new Date(Date.now() + 60 * 1000) })
		// const saved = await OtpModel.find()
		// console.log(saved)
		// await Promise.all(dpls.map(async (d) => {
		// 	return await Deployment.updateMany({ _id: d._id }, { publicId: nanoid(10) })
		// }))
		return;
		console.log(
			await Project.updateMany(
				{ _id: "6934502adfa2d8c1c254aabc" },
				{
					status: "NOT_STARTED",
					deployments: [],
					lastDeployment: null,
					tempDeployment: null,
					currentDeployment: null,
				},
			),
		);
	} catch (error) {
		console.log(error);
	} finally {
		process.exit(0);
	}
}
// mongodbData().then(async () => await mongoose.disconnect());

async function commitAllMessages() {
	const kafka = new Kafka({
		clientId: `api-server`,
		brokers: ["pkc-l7pr2.ap-south-1.aws.confluent.cloud:9092"],
		ssl: true,
		sasl: {
			mechanism: "plain",
			username: process.env.KAFKA_USERNAME as string,
			password: process.env.KAFKA_PASSWORD as string,
		},
	});

	const topic = "deployment.logs";
	const groupId = "vercel-logs-group";
	const admin = kafka.admin();
	await admin.connect();

	try {
		const topicMetadata = await admin.fetchTopicMetadata({ topics: [topic] });
		const partitions = topicMetadata.topics[0].partitions.map((p) => p.partitionId);

		const endOffsets = await admin.fetchTopicOffsets(topic);

		const offsetsToCommit = endOffsets.map(({ partition, offset }) => ({
			topic,
			partition,
			offset,
		}));

		await admin.setOffsets({ groupId, topic, partitions: offsetsToCommit });
		console.log("configs====>>>>>>>", { partitions });
		console.log(`✅ All uncommitted messages marked as consumed for group "${groupId}" on topic "${topic}".`);
	} catch (err) {
		console.error("❌ Error committing offsets:", err);
	} finally {
		await admin.disconnect();
	}
}
// commitAllMessages();
// --------------------------------
async function getClickhouseData() {
	// await client.insert({
	// 	table: "log_events_v2",
	// 	values: [
	// 		{
	// 			event_id: uuidV4(),
	// 			info: "WARN",
	// 			deployment_id: "--------------------------------",
	// 			project_id: "69246647869c614a349015fc",
	// 			log: "Hi Mom",
	// 			report_time: new Date().getTime(),
	// 			sequence: 69,
	// 		},
	// 	],
	// 	format: "JSONEachRow",
	// });
	// return
	const data = await client.query({
		query: `SELECT
  			toStartOfInterval(
    		toTimeZone(timestamp, 'Asia/Kolkata'),
    		INTERVAL 1 MINUTE
  			) as time,
  			count() as requests,
  			uniq(ip) as unique_visitors,
  			avg(response_time) as avg_response_time,
  			(SUM(response_size)) / 1024 / 1024 as total_bandwidth_mb
			FROM analytics
			WHERE project_id = '6934502adfa2d8c1c254aabc'
  			AND timestamp >= now() - INTERVAL 24 HOUR
			GROUP BY time
			ORDER BY time`,
		// format: "JSON",
	});
	const datas = await data.json();
	console.log(datas.data.length);
	console.log(datas.data);
	// await client.query({
	// 	query: "TRUNCATE analytics"
	// })
}
getClickhouseData().then(() => process.exit(0))
async function idChecker() {
	const obj = new Set();
	const id = "";
	return;
	for (let i = 0; i < 50; i++) {
		if (obj.has(id)) {
			console.log(" found at ", i, id);
		}
		try {
			obj.add(id);
		} catch (error) {
			console.log(i, " _ _ __ _ _");
			throw error;
		}
	}
	console.log(obj);
}
// idChecker()
