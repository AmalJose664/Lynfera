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
import { generateSlug } from "random-word-slugs"

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
		console.log(await Project.updateMany({ _id: "6934502adfa2d8c1c254aabc" }, {
			status: "NOT_STARTED", deployments: [],
			lastDeployment: null,
			tempDeployment: null,
			currentDeployment: null
		}))
		return;
		const project = await Project.findById("691e1c418cb08e07e28986dc").populate("deployments", "commit_hash");

		const userId = "68e4a04f1e57fa3fe5b1a81e"; //
		const user = await User.findById(userId);

		// await p.createProject({ name: "TEST_PROJECT_1", repoURL: "TEST_PROJECT_1_REPO", status: "READY", user: user._id, subdomain: "testable-subdomain", })
		return;

		const deplos = await Deployment.find({ project: project?._id }, { createdAt: 1, commit_hash: 1 }).sort("createdAt");

		console.log(deplos.map((dep) => ({ commit_hash: dep.commit_hash, time: formatTimeWithSeconds(new Date(dep.createdAt)) })));

	} catch (error) {
		console.log(error);
	} finally {
		process.exit(0);
	}
}
mongodbData().then(async () => await mongoose.disconnect());

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

async function getClickhouseData() {
	const insert = 2 === 2 + 3;

	if (insert) {
		console.log("inserting....");
		const analyticsRepo = new AnalyticsRepo(client);
		await analyticsRepo
			.insertBatch([
				{
					project_id: "2174919898sa8da98",
					subdomain: "wooden-little-terabyte-5628",
					timestamp: new Date().getTime(),
					path: "/assets/index.js",
					request_size: Math.floor(Math.random() * 10000),
					response_size: Math.floor(Math.random() * 10000),
					response_time: Math.floor(Math.random() * 100),
					ip: "127.0.0.1",
					status_code: Math.floor(Math.random() * 100),
					ua_browser: "chrome",
					ua_os: "windows",
					is_mobile: 1,
					is_bot: 0,
					referer: "",
				},
			])
			.catch((e) => console.log(e));
		return;
	}

	const data = await client.query({
		query: `select * from log_events`,
		// format: "JSON",
	});
	const datas = await data.json();
	console.log(datas.data.length);
	console.log(datas.data);
	// await client.query({
	// 	query: "TRUNCATE analytics"
	// })
}
// getClickhouseData().then(() => process.exit(0))
