import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { kafka } from "../config/kafka.config.js";


const DEPLOYMENT_IDS = ["69b6d927f05fac425bcfc3b0"];
const PROJECT_IDS = ["69b692161c4fecb9419d4a79"];
const LOG_LEVELS = ["info", "warn", "error", "decor"];
const STREAMS = ["stdout", "stderr"];
const MESSAGES = [
	"Build started successfully",
	"Installing dependencies...",
	"Running tests...",
	"Compilation failed: unexpected token",
	"Deploy step initiated",
	"Health check passed",
	"Container image pushed",
	"Rolling update in progress",
	"Timeout waiting for pod readiness",
	"Service restarted unexpectedly",
];

function randomFrom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function generateLog(sequence: number) {
	return {
		eventId: randomUUID(),
		eventType: "DEPLOYMENT_LOG",
		data: {
			deploymentId: randomFrom(DEPLOYMENT_IDS),
			projectId: randomFrom(PROJECT_IDS),
			log: {
				level: randomFrom(LOG_LEVELS).toUpperCase(),
				message: randomFrom(MESSAGES),
				timestamp: new Date().toISOString(),
				sequence,
				stream: randomFrom(STREAMS),
			},
		},
	};
}

export const producer = kafka.producer();
async function connectFN() {
	await producer.connect();
}
connectFN()
export async function produceTestLogs(req: Request, res: Response) {


	try {

		const size = Number(req.body.size) || 10
		const logs = Array.from({ length: size }, (_, i) => generateLog(i + 1));

		await producer.send({
			topic: "deployment.logs",
			messages: logs.map((log) => ({
				key: "log",
				value: JSON.stringify(log),
			})),
		});

		res.status(200).json({
			success: true,
			message: `Produced ${size} messages to deployment.logs`,
			sample: logs[0]
		});
	} catch (err) {
		console.error("Kafka produce error:", err);
		res.status(500).json({ success: false, error: String(err) });
	} finally {

	}
}

const TECH_STACKS = ["nextjs", "react", "nodejs", "python", "go", "vue"];
const STATUSES = ["READY", "FAILED", "CANCELLED"] as const;
const COMMIT_HASHES = [
	"a1b2c3d", "f4e5d6c", "9g8h7i6", "b3c4d5e", "1a2b3c4",
	"dead beef", "cafe1234", "0ff1ce00", "f00dface", "c0debabe",
].map(h => h.replace(" ", ""));


function randomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildStartPayload(deploymentId: string, projectId: string) {
	return {
		eventId: randomUUID(),
		eventType: "DEPLOYMENT_UPDATES",
		data: {
			deploymentId,
			projectId,
			updateType: "START",
			updates: {
				status: "READY",
				commit_hash: randomFrom(COMMIT_HASHES),
				techStack: randomFrom(TECH_STACKS),
				preventAutoPromoteDeployment: false,
			},
		},
	};
}

function buildEndPayload(
	deploymentId: string,
	projectId: string,
	outcome: "END" | "ERROR"
) {
	const status = outcome === "END" ? "READY" : randomFrom(["FAILED", "CANCELLED"] as const);
	const now = new Date();

	const install_ms = randomInt(2000, 8000);
	const build_ms = randomInt(5000, 20000);
	const upload_ms = randomInt(1000, 5000);
	const duration_ms = install_ms + build_ms + upload_ms + randomInt(500, 2000);

	const updates: Record<string, unknown> = {
		status,
		complete_at: now.toISOString(),
		duration_ms,
		install_ms,
		build_ms,
		upload_ms,
		commit_hash: randomFrom(COMMIT_HASHES),
		techStack: randomFrom(TECH_STACKS),
		preventAutoPromoteDeployment: false,
	};

	if (outcome === "ERROR") {
		updates.error_message = randomFrom([
			"Build failed: module not found",
			"Out of memory during compilation",
			"Deployment timeout exceeded",
			"Health check failed after 3 attempts",
			"Invalid environment variable configuration",
		]);
	}

	return {
		eventId: randomUUID(),
		eventType: "DEPLOYMENT_UPDATES",
		data: {
			deploymentId,
			projectId,
			updateType: outcome,
			updates,
		},
	};
}

export async function produceDeploymentUpdate(req: Request, res: Response) {
	const producer = kafka.producer();

	const deploymentId = randomFrom(DEPLOYMENT_IDS);
	const projectId = randomFrom(PROJECT_IDS);
	const delayMs = randomInt(3000, 7000);
	const outcome: "END" | "ERROR" = Math.random() > 0.3 ? "END" : "ERROR";

	try {
		await producer.connect();

		// 1. Send START immediately
		const startPayload = buildStartPayload(deploymentId, projectId);
		await producer.send({
			topic: "deployment.updates",
			messages: [{ key: "update", value: JSON.stringify(startPayload) }],
		});

		// Respond to client right away — don't hold the HTTP request
		res.status(200).json({
			success: true,
			message: `START sent. ${outcome} will follow in ~${delayMs}ms`,
			deploymentId,
			projectId,
			outcome,
			startPayload,
		});

		// 2. Wait, then send END or ERROR in background
		await new Promise(resolve => setTimeout(resolve, delayMs));

		const endPayload = buildEndPayload(deploymentId, projectId, outcome);
		await producer.send({
			topic: "deployment.updates",
			messages: [{ key: "update", value: JSON.stringify(endPayload) }],
		});

		console.log(`[kafka] ${outcome} sent for deployment ${deploymentId}`);
	} catch (err) {
		console.error("Kafka update produce error:", err);
		// Response may already be sent, so just log
		if (!res.headersSent) {
			res.status(500).json({ success: false, error: String(err) });
		}
	} finally {
		await producer.disconnect();
	}
}