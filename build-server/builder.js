/**
 * @file builder.js
 * @description Core build runner for the Lynfera build server.
 *
 * This is the main entry point executed inside the Docker container for every
 * deployment. It orchestrates the full lifecycle of a frontend project build:
 *
 *   1. Reads secrets securely from stdin (injected by main.sh).
 *   2. Initialises the Kafka producer and S3 client.
 *   3. Fetches project and deployment metadata from the API server.
 *   4. Clones the user's Git repository (supports private GitHub repos via
 *      GitHub App installation tokens).
 *   5. Validates package.json for suspicious scripts.
 *   6. Detects the frontend framework and build tool (Vite, CRA, Angular, etc.).
 *   7. Runs `npm install` with automatic retry logic (up to 3 attempts with
 *      progressively looser flags: default → --legacy-peer-deps → --force).
 *   8. Runs `npm run build` with optional framework-specific base-path flags.
 *   9. Validates the build output (file count, individual file size, total size).
 *  10. Uploads every output file to S3 (or a local storage server for dev).
 *  11. Publishes real-time log messages and deployment status updates to Kafka.
 *  12. Reports build status to GitHub Check Runs API (start + complete).
 *  13. Handles errors, cancellations, and graceful shutdown.
 *
 * Environment variables consumed (injected by the API server at container
 * start-up; sensitive values are passed via stdin and deleted from the
 * environment immediately after reading):
 *   - DEPLOYMENT_ID        – MongoDB ObjectId of the deployment being built.
 *   - PROJECT_ID           – MongoDB ObjectId of the parent project.
 *   - API_ENDPOINT         – Base URL of the internal API server.
 *   - SERVICE_TOKEN        – Bearer token for internal API calls.
 *   - INSTALLATION_ACCESS_TOKEN – GitHub App installation token (private repos).
 *   - GIT_COMMIT_DATA      – Pre-fetched commit hash + message ("hash||msg").
 *   - CLOUD_BUCKET         – S3 bucket name for build artifact storage.
 *   Secrets passed via stdin (see cleanEnv / main.sh):
 *   - CONTAINER_API_TOKEN  – Token for authenticating with the API server.
 *   - CLOUD_ACCESSKEY      – S3-compatible storage access key.
 *   - CLOUD_SECRETKEY      – S3-compatible storage secret key.
 *   - CLOUD_ENDPOINT       – S3-compatible storage endpoint URL.
 *   - KAFKA_USERNAME        – Kafka SASL username.
 *   - KAFKA_PASSWORD        – Kafka SASL password.
 *
 * User-controlled build settings (set via project environment variables):
 *   - LYNFERA_SETTING_SKIP_INSTALL          – Skip npm install entirely.
 *   - LYNFERA_SETTING_SKIP_BUILD            – Skip npm run build entirely.
 *   - LYNFERA_SETTING_INSTALL_RETRIES       – Max install attempts (1–3).
 *   - LYNFERA_SETTING_SKIP_DECOR_LOGS       – Suppress decorative log lines.
 *   - LYNFERA_SETTING_FRAMEWORK             – Override auto-detected framework.
 *   - LYNFERA_PREVENT_DEPLOYMENT_AUTO_PROMOTION – Prevent auto-promotion.
 *   - LYNFERA_SETTING_TREAT_AS_STATIC_SITE  – Treat project as a static site
 *                                             (skips install + build).
 */

import { execa } from 'execa';
import { existsSync, } from "fs"
import { readdir, stat, rename, mkdir, rm, readFile } from 'fs/promises';
import { createWriteStream, readFileSync, createReadStream } from "fs"
import path from "path"
import mime from "mime-types"
import { Kafka } from "kafkajs"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { fileURLToPath } from "url";
import { randomUUID } from "crypto"
import simpleGit from "simple-git";
import archiver from "archiver";
import FormData from "form-data";
import axios from 'axios';
import pLimit from "p-limit"

// Deployment and project IDs are injected by the API server as environment
// variables. The fallback "---" is used only during local development.
let DEPLOYMENT_ID = process.env.DEPLOYMENT_ID || "---"   // Received from env by apiserver or use backup for local testing
let PROJECT_ID = process.env.PROJECT_ID || "---"   // Received from env by apiserver or use backup for local testing
const brandName = "Lynfera"

// Kafka producer and S3 client are initialised lazily in createClients() after
// secrets are read from stdin, so they start as null.
let kafkaProducer = null
let API_SERVER_CONTAINER_API_TOKEN = null


let s3Client = null
const BUCKET_NAME = process.env.CLOUD_BUCKET

console.log("Starting file..")
const git = simpleGit();
// Limit concurrent S3 upload operations to avoid overwhelming the connection pool.
const limit = pLimit(8);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Custom error class for expected, recoverable build failures.
 *
 * Using a dedicated class lets the top-level error handler distinguish between
 * anticipated build errors (wrong branch, bad package.json, etc.) and
 * unexpected runtime exceptions, so it can report the right status to Kafka
 * and GitHub.
 *
 * @property {boolean} isContainerError - Always true; used as a type guard.
 * @property {string}  stream           - The log stream where the error occurred
 *                                        (e.g. "git clone", "stderr", "upload").
 * @property {string}  cause            - Human-readable explanation shown to the user.
 * @property {boolean} cancelled        - When true the deployment is marked CANCELLED
 *                                        instead of FAILED (e.g. invalid state).
 */
class ContainerError extends Error {
	isContainerError = true
	constructor(message, stream, cause = "", cancelled = false) {
		super(message, cause);
		this.name = "CUSTOM_ERROR";
		this.stream = stream
		this.cause = cause
		this.cancelled = cancelled
	}
}
/** Possible deployment lifecycle states sent to the API server via Kafka. */
const deploymentStatus = {
	NOT_STARTED: "NOT_STARTED",
	QUEUED: "QUEUED",
	BUILDING: "BUILDING",
	READY: "READY",
	FAILED: "FAILED",
	CANCELED: "CANCELLED"
}
/** Log severity levels used when publishing messages to the Kafka log topic. */
const logValues = {
	INFO: "INFO",
	SUCCESS: "SUCCESS",
	ERROR: "ERROR",
	DECOR: "DECOR",
	WARN: "WARN"
}

/**
 * Feature flags that control build server behaviour.
 * Most flags are toggled for local development or testing; production values
 * are shown in the comments.
 */
const settings = {
	runnOnlyQueuedDeplymnts: !true, // only run if deployment is in queued state
	customBuildPath: !true,
	sendKafkaMessage: true,
	deleteSourcesAfter: !true,
	sendLocalDeploy: !true,       // for sending uploads to non s3
	localDeploy: !true,           // for non s3 uploads
	runCommands: true,            // for testing only 
	cloneRepo: true,            // for testing only 
	uploadArtifacts: true,       // for disabling uploading in dev
	githubCheckRuns: {
		sendStart: true,
		sendStop: true
	}
}

console.log(DEPLOYMENT_ID, PROJECT_ID, "<<<<<")

let gitCommitData = process.env.GIT_COMMIT_DATA || "----||----"

/**
 * Per-deployment user-controlled settings.
 * These are populated from the project's environment variables by
 * applyUserSettingsChanges() before the build starts.
 */
const userSettings = {
	skipInstall: false,
	skipBuild: false,
	maxInstallTries: 3,
	skipDecorLogs: false,
	frameworkSetByUser: null,
	preventAutoPromoteDeployment: false,
	treatAsGenericProject: false
}

// Running log sequence counter and in-memory buffer used for batched Kafka sends.
let logsNumber = 0
let logBuffer = [];
let flushTimer = null;
// ----------------------------------------------------FUNCTIONS--------------------------------------------------

/**
 * Removes sensitive credentials from the Node.js process environment.
 * Called immediately after the secrets have been consumed and the Kafka /
 * S3 clients have been initialised, so they are never accessible to user
 * build scripts.
 */
const deleteEnvs = () => {

	delete process.env.KAFKA_USERNAME;
	delete process.env.KAFKA_PASSWORD;
	delete process.env.CLOUD_SECRETKEY;
	delete process.env.CLOUD_ACCESSKEY;
	delete process.env.CONTAINER_API_TOKEN;
	delete process.env.CLOUD_ENDPOINT;
	delete process.env.CLOUD_BUCKET;

}

/**
 * Flushes the in-memory log buffer to Kafka as a single batch.
 * Clears any pending flush timer before sending to avoid duplicate sends.
 * Silently swallows Kafka errors so a logging failure never crashes the build.
 */
const sendLogsAsBatch = async () => {

	if (flushTimer) {
		clearTimeout(flushTimer);
		flushTimer = null;
	}
	if (logBuffer.length === 0) return;
	const logsToSend = [...logBuffer];
	logBuffer.length = 0;
	try {
		await kafkaProducer.send({
			topic: "deployment.logs",
			messages: logsToSend.map(log => ({
				key: "log",
				value: JSON.stringify(log)
			}))
		});
		console.log(`Sent ${logsToSend.length} logs`);

	} catch (error) {
		console.error("Kafka batch send failed:", error);
	}
}
/**
 * Enqueues a log entry and schedules a batched Kafka send.
 *
 * Logs are buffered in memory and flushed either when the buffer reaches 50
 * entries or after a 400 ms idle timeout, whichever comes first. This reduces
 * the number of Kafka round-trips without introducing noticeable latency.
 *
 * @param {object} logData
 * @param {string} logData.DEPLOYMENT_ID - Deployment ObjectId.
 * @param {string} logData.PROJECT_ID    - Project ObjectId.
 * @param {string} logData.level         - One of the logValues constants.
 * @param {string} logData.message       - The log message text (may contain ANSI codes).
 * @param {string} logData.stream        - Source stream label (e.g. "stdout", "system").
 */
const publishLogs = (logData = {}) => {
	logsNumber++;
	if (!settings.sendKafkaMessage) return
	if (userSettings.skipDecorLogs) {
		if (logData.level === logValues.DECOR) {
			return
		}
	}
	logBuffer.push({
		eventId: randomUUID(),
		eventType: 'DEPLOYMENT_LOG',
		data: {
			deploymentId: logData.DEPLOYMENT_ID,
			projectId: logData.PROJECT_ID,
			log: {
				level: logData.level,
				message: logData.message,
				timestamp: new Date().toISOString(),
				sequence: logsNumber,
				stream: logData.stream
			}
		}
	});
	if (flushTimer) {
		clearTimeout(flushTimer);
		flushTimer = null;
	}

	if (logBuffer.length >= 50) {
		sendLogsAsBatch();
	} else {
		flushTimer = setTimeout(sendLogsAsBatch, 400);
	}
}

/** Returns a string of `n` space-separated copies of `s`. Used for log indentation. */
const repeat = (s, n) => Array.from({ length: n }).fill(s).join(" ")
/** Returns a cyan ANSI-coloured horizontal rule of `n` double-dash segments. */
const line = (n) => "\x1b[38;5;14m" + (Array.from({ length: n }).fill("──").join("")) + "\x1b[0m"

/**
 * Publishes the decorative build-server banner and deploy configuration summary
 * to the log stream. These are DECOR-level messages and can be suppressed via
 * the LYNFERA_SETTING_SKIP_DECOR_LOGS environment variable.
 */
const printInfoLogs = () => {
	if (userSettings.skipDecorLogs) return
	const symbols = ["✮", "❁", "✧", "❃", "✾", "✣", "─", "❆", "❀", "✴"]
	const deco = `${symbols[3]}`
	const side = "\x1b[38;5;27m ➤  \x1b[0m "

	const spaceValue = 3
	const decorationsArray = [];
	decorationsArray.push(repeat(" ", 25))

	decorationsArray.push(" \x1b[96m" + repeat(deco, 120) + "\x1b[0m")
	decorationsArray.push(" \x1b[96m" + repeat(deco, 20) + `\x1b[0m  \x1b[\x1b[1m\x1b[38;2;39;199;255m   ${brandName.toUpperCase()} BUILD SERVER   \x1b[0m\x1b[96m` + repeat(deco, 20) + "\x1b[0m")
	decorationsArray.push(" \x1b[96m" + repeat(deco, 120) + "\x1b[0m")
	decorationsArray.push(line(100))
	decorationsArray.push(repeat(" ", 25))

	// ENVIRONMENT

	decorationsArray.push(repeat(" ", 25))
	decorationsArray.push(`${side} ${repeat(" ", spaceValue - 3)}\x1b[38;5;123m __ ENVIRONMENT\x1b[0m`)
	decorationsArray.push(`${side} ${repeat(" ", spaceValue)}\x1b[38;5;27m Runtime             :\x1b[38;5;123m Node.js\x1b[0m`)
	decorationsArray.push(`${side} ${repeat(" ", spaceValue)}\x1b[38;5;27m Node Version        :\x1b[38;5;123m 22.21.1\x1b[0m`)

	decorationsArray.push(line(100))

	// DEPLOY CONFIGS
	decorationsArray.push(repeat(" ", 25))

	decorationsArray.push(repeat(" ", 25))
	decorationsArray.push(`${side} ${repeat(" ", spaceValue - 3)}\x1b[38;5;123m __ DEPLOY CONFIGS \x1b[0m`)
	decorationsArray.push(`${side} ${repeat(" ", spaceValue)} \x1b[38;5;27m Install Command     : \x1b[38;5;123m npm install\x1b[0m`)
	decorationsArray.push(`${side} ${repeat(" ", spaceValue)} \x1b[38;5;27m Build Command       : \x1b[38;5;123m npm run build\x1b[0m`)
	decorationsArray.push(`${side} ${repeat(" ", spaceValue)} \x1b[38;5;27m Output Directory    : \x1b[38;5;123m dist/\x1b[0m`)
	decorationsArray.push(`${side} ${repeat(" ", spaceValue)} \x1b[38;5;27m Root Directory      : \x1b[38;5;123m ./\x1b[0m`)

	decorationsArray.push(line(100))
	decorationsArray.push(repeat("  ", 25))

	decorationsArray.push(repeat("  ", 25))
	decorationsArray.push(" \x1b[96m" + repeat(deco, 4) + "   ➤ STARTING BUILD PROCESS   " + repeat(deco, 4) + "\x1b[0m")
	decorationsArray.push(" \x1b[96m" + repeat(deco, 25) + "\x1b[0m")

	decorationsArray.push(repeat(" ", 25))

	decorationsArray.map((v) => publishLogs({
		DEPLOYMENT_ID, PROJECT_ID,
		level: logValues.DECOR,
		message: v, stream: "system"
	}))
}

/**
 * Publishes a deployment status update event to the "deployment.updates" Kafka topic.
 *
 * Update types include START, END, and ERROR. Only the fields present in
 * updateData are included in the Kafka message payload.
 *
 * @param {object} updateData
 * @param {string} updateData.DEPLOYMENT_ID  - Deployment ObjectId.
 * @param {string} updateData.PROJECT_ID     - Project ObjectId.
 * @param {string} updateData.type           - Event type: "START" | "END" | "ERROR".
 * @param {string} [updateData.status]       - New deployment status.
 * @param {string} [updateData.user]         - User ObjectId who triggered the build.
 * @param {string} [updateData.complete_at]  - ISO timestamp of completion.
 * @param {number} [updateData.duration_ms]  - Total build duration in milliseconds.
 * @param {string} [updateData.techStack]    - Detected or user-specified framework.
 * @param {number} [updateData.install_ms]   - npm install duration in milliseconds.
 * @param {number} [updateData.build_ms]     - npm run build duration in milliseconds.
 * @param {number} [updateData.upload_ms]    - Upload duration in milliseconds.
 * @param {string} [updateData.commit_hash]  - Git commit hash + message ("hash||msg").
 * @param {string} [updateData.error_message]- Human-readable error description.
 * @param {object} [updateData.file_structure]- Output file list and total size.
 */
const publishUpdates = async (updateData = {}) => {
	if (!settings.sendKafkaMessage) return
	try {
		const value = JSON.stringify({
			eventId: randomUUID(),
			eventType: 'DEPLOYMENT_UPDATES',
			data: {
				deploymentId: updateData.DEPLOYMENT_ID,
				projectId: updateData.PROJECT_ID,
				updateType: updateData.type,
				updates: {
					...(updateData.status && { status: updateData.status }),
					...(updateData.user && { user: updateData.user }),
					...(updateData.complete_at && { complete_at: updateData.complete_at }),
					...(updateData.duration_ms && { duration_ms: updateData.duration_ms }),
					...(updateData.techStack && { techStack: updateData.techStack }),
					...(updateData.install_ms && { install_ms: updateData.install_ms }),
					...(updateData.build_ms && { build_ms: updateData.build_ms }),
					...(updateData.upload_ms && { upload_ms: updateData.upload_ms }),
					...(updateData.commit_hash && { commit_hash: updateData.commit_hash }),
					...(updateData.error_message && { error_message: updateData.error_message }),
					...(updateData.file_structure && { file_structure: updateData.file_structure }),
					...(true && { preventAutoPromoteDeployment: userSettings.preventAutoPromoteDeployment }),
				}
			}
		})
		await kafkaProducer.send({
			topic: "deployment.updates", messages: [
				{ key: "log", value: value }
			]
		})
		console.log("update Sent", updateData.type)
	} catch (error) {
		console.log("error on sending update", updateData.type, error)
	}
}

/**
 * Clones the project's Git repository into taskDir and verifies the clone succeeded.
 *
 * For private GitHub repositories the installation access token is injected into
 * the clone URL as HTTP basic-auth credentials (x-access-token:<token>).
 * A shallow, single-branch clone is used to minimise download size.
 *
 * @param {string} taskDir     - Absolute path to the working directory.
 * @param {string} runDir      - Absolute path to the root directory inside the clone
 *                               (may differ from taskDir when rootDir is set).
 * @param {object} projectData - Project document from the API server.
 * @throws {ContainerError} On authentication failure, missing branch, or network errors.
 */
async function cloneGitRepoAndValidate(taskDir, runDir, projectData) {

	if (settings.cloneRepo) {
		let cloneUrl = projectData.repoURL
		if (projectData.provider === 'GITHUB' && projectData.isPrivateGhRepo) {
			const installAccessToken = process.env.INSTALLATION_ACCESS_TOKEN.replace(/\r$/, "")
			if (!installAccessToken) {
				throw new ContainerError("Insufficient Project Data;", "git clone", "Github installation access token not found.")
			}
			const url = new URL(cloneUrl)
			url.username = 'x-access-token'
			url.password = installAccessToken
			cloneUrl = url.toString()
		}
		try {
			await git.clone(cloneUrl, taskDir, [
				'--filter=blob:none',
				'--branch', projectData.branch,
				'--single-branch'
			])
		} catch (error) {
			const msg = error.message.toLowerCase()
			let errorMessageToShow = ""
			let cause = ""
			if (msg.includes("authentication failed") || msg.includes("permission denied")) {
				errorMessageToShow = `Authentication failed for '${projectData.repoURL}'`
				cause = "Please check your GitHub App or credentials"
			}
			else if (msg.includes("repository not found")) {
				errorMessageToShow = `Repository not found '${projectData.repoURL}'`
				cause = "Invalid repo URL or private repository"
			}
			else if (msg.includes("remote branch") && msg.includes("not found")) {
				errorMessageToShow = `Branch '${projectData.branch}' not found on repo '${projectData.repoURL}'`
				cause = "Please check the branch name"
			}
			else {
				errorMessageToShow = `Git clone failed for '${projectData.repoURL}'`
				cause = "Check network, permissions, and repository URL"
			}

			throw new ContainerError(
				"Git clone error: " + errorMessageToShow,
				"git clone",
				cause
			)

		}


	} else {
		console.log("skiping git clone")
	}
	if (!existsSync(runDir)) {
		throw new ContainerError("Git repo not found or cloned..", "file validation")
	}
	else {
		return true
	}
}

/**
 * Reads the latest commit hash and message from the cloned repository.
 *
 * @param {string} taskDir - Absolute path to the cloned repository root.
 * @returns {Promise<string>} A string in the format "hash||message", or
 *                            "----||----" if the repository has no commits.
 */
async function getGitCommitData(taskDir) {
	const repoGit = simpleGit(taskDir);
	const logss = await repoGit.log({})
	if (logss.all.length === 0) {
		return "----||----"
	}
	return logss.all[0].hash + "||" + logss.all[0].message
}

/**
 * Fetches project and deployment data from the internal API server.
 *
 * Retries up to 4 times on transient network errors (5xx, 429, 408, connection
 * resets, DNS failures) with a 3.5-second delay between attempts. Non-retryable
 * errors (4xx, invalid data) are thrown immediately.
 *
 * @param {string} deploymentId - The deployment ObjectId to look up.
 * @returns {Promise<[object, object]>} Tuple of [projectData, deploymentData].
 * @throws {ContainerError} If the deployment or project cannot be found, or if
 *                          the deployment is not in QUEUED state (when enforced).
 */
async function fetchProjectData(deploymentId = "") {
	const API_ENDPOINT = process.env.API_ENDPOINT
	const baseUrl = `${API_ENDPOINT}/api/internal`
	const SERVICE_TOKEN = process.env.SERVICE_TOKEN.replace(/\r$/, "")

	async function fetchData(times = 0, errorReceived = null,) {
		if (times >= 4) {
			if (errorReceived?.isContainerError || errorReceived instanceof ContainerError) {
				throw errorReceived
			}
			if (axios.isAxiosError(errorReceived)) {
				publishLogs({
					DEPLOYMENT_ID, PROJECT_ID,
					level: logValues.ERROR,
					message: `Error on fetching Project data, ${errorReceived.message}`,
					stream: "data fetching"
				});
				throw new ContainerError("Api server not reachable " + errorReceived.message, "data fetching", "Server Error")
			}
			throw errorReceived
			return
		}
		console.log("Api request No: ", times + 1)
		try {
			const deploymentResponse = await axios.get(`${baseUrl}/deployments/${deploymentId}`, {
				timeout: 24000,
				headers: {
					Authorization: `Bearer ${SERVICE_TOKEN}`,
					'X-Static-Token': API_SERVER_CONTAINER_API_TOKEN
				}
			})

			const deploymentData = deploymentResponse.data
			if (!deploymentData.deployment) {
				throw new ContainerError("Deployment data not found", "data fetching", "Invalid project or deployment Id")
			}
			if (settings.runnOnlyQueuedDeplymnts && deploymentData.deployment.status !== deploymentStatus.QUEUED) {
				throw new ContainerError("Invalid Deployment",
					"data fetching",
					"Deployment is in invalid state to start the build; Must be in QUEUED state; -> " + deploymentData.deployment.status, true
				)
			}

			const projectId = deploymentData.deployment.project
			const projectResponse = await axios.get(`${baseUrl}/projects/${projectId}`, {
				timeout: 24000,
				headers: {
					Authorization: `Bearer ${SERVICE_TOKEN}`,
					'X-Static-Token': API_SERVER_CONTAINER_API_TOKEN
				}
			})

			const projectData = projectResponse.data
			if (!projectData.project) {
				throw new ContainerError("Project data not found", "data fetching", "Invalid project or deployment Id")
			}

			if (deploymentData.deployment.project !== projectData.project._id) {
				throw new ContainerError("Project data not found", "data fetching", "Invalid project or deployment Id")
			}
			if (!projectData.project.installCommand) {
				publishLogs({
					DEPLOYMENT_ID, PROJECT_ID,
					level: logValues.WARN,
					message: "install command not found; running with default command", stream: "data error"
				})
				//logs

			}
			if (!projectData.project.buildCommand) {
				publishLogs({
					DEPLOYMENT_ID, PROJECT_ID,
					level: logValues.WARN,
					message: "build command not found; running with default command", stream: "data error"
				})
				//logs
			}

			return [projectData.project, deploymentData.deployment]
		} catch (error) { // Currently this retries with data already fetched but that not a big problem for now
			console.log("Error on data fetching; ", error.message)
			const isAxiosErr = axios.isAxiosError(error)
			const status = error?.response?.status
			const retryableCodes = [
				'ECONNABORTED',
				'ECONNRESET',
				'ENOTFOUND',
				'EAI_AGAIN',
				'ETIMEDOUT'
			]

			const shouldRetry = isAxiosErr &&
				(
					!error.response || status >= 500 || status === 429 || status === 408 || retryableCodes.includes(error.code)
				)

			if (shouldRetry) {
				console.log("Waiting for retry...")
				await new Promise(res => setTimeout(res, 3500))
				return fetchData(times + 1, error)
			}
			console.log("Cant rety; Exiting...")
			if (error?.isContainerError || error instanceof ContainerError) {
				throw error
			}
			if (axios.isAxiosError(error)) {
				publishLogs({
					DEPLOYMENT_ID, PROJECT_ID,
					level: logValues.ERROR,
					message: `Error on fetching Project data, ${error.message}`,
					stream: "data fetching"
				});
				throw new ContainerError("Api server not reachable " + error.message, "data fetching", "Server Error")
			}
			throw error
		}
	}
	return await fetchData()

}

/**
 * Validates that the user-supplied source and output directory paths are safe.
 *
 * Resolves both paths relative to taskDir and ensures they remain inside it,
 * preventing path-traversal attacks (e.g. "../../etc").
 *
 * @param {string} taskDir     - Absolute path to the container working directory.
 * @param {string} buildSource - Relative path to the project root directory.
 * @param {string} buildOutput - Relative path to the build output directory.
 * @returns {{ taskDir: string, sourceDir: string, outputDir: string, isValid: boolean }}
 * @throws {ContainerError} If either path escapes taskDir (cancelled = true).
 */
function validateDirectories(taskDir, buildSource = "", buildOutput = "") {

	function isWithinTaskDir(userPath, pathType) {

		const sanitized = userPath.replace(/^[\/\\]+/, '');
		const resolvedPath = path.resolve(taskDir, sanitized);

		const isValid = resolvedPath.startsWith(taskDirAbs + path.sep) || resolvedPath === taskDirAbs;
		if (!isValid) {
			throw new ContainerError(`${pathType} path - ${userPath} must be inside the repository root directory`,
				"file validation", "Invalid paths", true
			);
		}

		return resolvedPath;
	}

	const taskDirAbs = path.resolve(taskDir);
	const sourceDirAbs = isWithinTaskDir(buildSource, 'Source');
	const outputDirAbs = isWithinTaskDir(buildOutput, 'Output');
	return {
		taskDir: taskDirAbs,
		sourceDir: sourceDirAbs,
		outputDir: outputDirAbs,
		isValid: true
	};
}
/**
 * Returns the CLI flag or environment variable needed to set the public base
 * path to "./" for the given build tool.
 *
 * This ensures that asset URLs in the built HTML are relative, which is
 * required for the static files to load correctly when served from a CDN
 * sub-path.
 *
 * @param {string} tool - Build tool name (e.g. "Vite", "CRA", "Angular CLI").
 * @returns {string} The flag/env string, or an empty string if not applicable.
 */
function getDynamicBuildRoot(tool = "") {
	tool = tool.toLowerCase();

	switch (true) {
		case tool.includes("vite"):
			return "--base=./";

		case tool.includes("cra") || tool.includes("react-scripts"):
			return "PUBLIC_URL=.";

		case tool.includes("angular"):
			return "--base-href ./ --configuration production";

		case tool.includes("parcel"):
			return "--public-url ./";

		case tool.includes("webpack"):
			return "output.publicPath = './'";

		case tool.includes("snowpack"):
			return "--base-url ./";

		case tool.includes("astro"):
			return "--base ./";

		default:
			return "";
	}
}

/**
 * Inspects a project's package.json dependencies to identify the frontend
 * framework and build tool in use.
 *
 * Detection is based on well-known package names. The result is used to:
 *   - Log the detected stack to the user.
 *   - Pass the correct base-path flag to the build command.
 *   - Report the tech stack in the deployment update event.
 *
 * @param {object} pkg - Parsed package.json object.
 * @returns {{ framework: string, tool: string }} Detected framework and tool names.
 */
function detectFrontendBuildConfig(pkg = {}) {
	const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
	const names = Object.keys(deps).map(n => n.toLowerCase());

	const hasExact = name => names.includes(name.toLowerCase());
	const hasLike = substr => names.some(n => n.includes(substr.toLowerCase()));

	let tool = 'Unknown';
	if (hasExact('vite')) tool = 'Vite';
	else if (hasExact('react-scripts')) tool = 'CRA';
	else if (hasExact('@angular/cli')) tool = 'Angular CLI';
	else if (hasLike('parcel')) tool = 'Parcel';
	else if (hasLike('webpack')) tool = 'Webpack';
	else if (hasLike('snowpack')) tool = 'Snowpack';
	else if (hasLike('rollup')) tool = 'Rollup';

	let framework = 'Unknown';
	if (hasExact('@angular/core') || hasLike('@angular/')) framework = 'Angular';
	else if (hasExact('react') || hasLike('react-dom')) framework = 'React';
	else if (hasExact('vue') || hasLike('@vue/') || hasLike('vue-router')) framework = 'Vue';
	else if (hasExact('svelte') || hasLike('svelte/')) framework = 'Svelte';
	else if (hasExact('solid-js') || hasLike('solid-start')) framework = 'Solid';
	else if (hasExact('preact') || hasLike('preact/')) framework = 'Preact';
	else if (hasExact('lit') || hasLike('lit-element') || hasLike('lit-html')) framework = 'Lit';
	else if (hasExact('alpinejs') || hasLike('alpinejs')) framework = 'Alpine';
	else if (hasExact('ember-source') || hasLike('ember-')) framework = 'Ember';

	return { framework, tool };
}

/**
 * Reads user-controlled build settings from the project's environment variables
 * and applies them to the mutable userSettings object.
 *
 * Settings are read from the same env map that is passed to the build commands,
 * so they are consumed before being forwarded to npm. Boolean values accept
 * "true", "1", "yes", and "on" (case-insensitive).
 *
 * @param {Map<string, string>} env - Map of environment variable names to values.
 */
function applyUserSettingsChanges(env = new Map()) {
	function envBool(value, defaultValue = false) {
		if (value === undefined || value === null) return defaultValue
		if (typeof value === "boolean") return value

		return ["true", "1", "yes", "on"].includes(
			String(value).toLowerCase()
		)
	}
	const settingEnvNames = {
		skipInstall: "LYNFERA_SETTING_SKIP_INSTALL",
		skipBuild: "LYNFERA_SETTING_SKIP_BUILD",
		maxInstallTries: "LYNFERA_SETTING_INSTALL_RETRIES", //  <=3
		skipDecorLogs: "LYNFERA_SETTING_SKIP_DECOR_LOGS", //  skip unwanted logs,
		frameworkSetByUser: "LYNFERA_SETTING_FRAMEWORK",
		preventAutoPromoteDeployment: "LYNFERA_PREVENT_DEPLOYMENT_AUTO_PROMOTION",
		treatAsGenericProject: "LYNFERA_SETTING_TREAT_AS_STATIC_SITE"
	}
	if (envBool(env.get(settingEnvNames.skipInstall))) {
		userSettings.skipInstall = true
	}
	if (envBool(env.get(settingEnvNames.skipBuild))) {
		userSettings.skipBuild = true
	}
	if (envBool(env.get(settingEnvNames.skipDecorLogs))) {
		userSettings.skipDecorLogs = true
	}
	if (envBool(env.get(settingEnvNames.treatAsGenericProject))) {
		userSettings.treatAsGenericProject = true
		userSettings.skipBuild = true
		userSettings.skipInstall = true
	}
	if (envBool(env.get(settingEnvNames.preventAutoPromoteDeployment), false)) {
		userSettings.preventAutoPromoteDeployment = true
	}
	if (env.get(settingEnvNames.frameworkSetByUser)) {
		userSettings.frameworkSetByUser = env.get(settingEnvNames.frameworkSetByUser)
	}

	const tries = Number(env.get(settingEnvNames.maxInstallTries))
	if (Number.isInteger(tries) && tries > 0 && tries <= 3) {
		userSettings.maxInstallTries = tries
	}
}

/**
 * Merges server-injected environment variables with the user's project env vars
 * and produces two separate env arrays: one for the install step and one for
 * the build step.
 *
 * Server variables (e.g. LYNFERA_BUILD_ID, CI) take precedence unless the
 * variable is marked canOverride=true, in which case the user's value wins.
 * The install step uses NODE_ENV=development; the build step uses NODE_ENV=production.
 *
 * @param {{name: string, value: string}[]} envs - User-defined project env vars.
 * @param {{ project: object, deployment: object, gitData: string }} requiredData
 * @returns {{ finalEnvsBuild: object[], finalEnvsInstall: object[] }}
 */
function getBuildServerEnvsWithUserEnvs(envs = [], requiredData = {}) {
	const { project, deployment } = requiredData
	const lynfera = brandName.toUpperCase()
	const urlSuffix = ".lynfera.qzz.io"
	const applyUserOverridesAndConsume = (server = [{ name: "", value: "" }], userAsMap = new Map()) => {
		return server.map((sEv) => {
			let { name, value } = sEv
			const { canOverride } = sEv
			if (userAsMap.has(name)) {
				if (canOverride) {
					value = userAsMap.get(name)
				}
				userAsMap.delete(name)
			}
			return { name, value }
		})
	}
	const serverEnvs = [
		{ name: "CI", value: "true", canOverride: false },
		{ name: lynfera + "_BUILD_ID", value: deployment._id, canOverride: false },
		{ name: lynfera + "_GIT_COMMIT_SHA", value: requiredData.gitData.split("||")[0], canOverride: true },
		{ name: lynfera + "_GIT_BRANCH", value: project.branch, canOverride: true },
		{ name: lynfera + "_PUBLIC_ID", value: deployment.publicId, canOverride: true },
		{ name: lynfera + "_PROJECT_ID", value: project._id, canOverride: true },
		{ name: lynfera + "_PROJECT_URL", value: project.subdomain + urlSuffix, canOverride: true },
		{ name: lynfera + "_DEPLOYMENT_URL", value: deployment.publicId + urlSuffix, canOverride: true },
		{ name: lynfera + "_BUILD", value: "1", canOverride: true },
		{ name: "NODE_VERSION", value: "22", canOverride: true },
	]
	const installOnlyEnvs = [
		{ name: "NODE_ENV", value: "development", canOverride: false },
	]
	const buildOnlyEnvs = [
		{ name: "NODE_ENV", value: "production", canOverride: false },
	]
	const userEnvsMapInstall = new Map(envs.map((ev) => [ev.name, ev.value]))
	const userEnvsMapBuild = new Map(envs.map((ev) => [ev.name, ev.value]))
	applyUserSettingsChanges(userEnvsMapInstall)

	const updatedServerEnvsInstall = applyUserOverridesAndConsume([...serverEnvs, ...installOnlyEnvs], userEnvsMapInstall)
	const updatedServerEnvsBuild = applyUserOverridesAndConsume([...serverEnvs, ...buildOnlyEnvs], userEnvsMapBuild)

	const newUserEnvsInstall = Array.from(userEnvsMapInstall, ([key, value]) => ({
		name: key,
		value: value,
	}));
	const newUserEnvsBuild = Array.from(userEnvsMapInstall, ([key, value]) => ({
		name: key,
		value: value,
	}));

	const finalEnvsInstall = [...updatedServerEnvsInstall, ...newUserEnvsInstall]
	const finalEnvsBuild = [...updatedServerEnvsBuild, ...newUserEnvsBuild]

	return { finalEnvsBuild, finalEnvsInstall }
}

/**
 * Reads and validates the project's package.json, then returns the detected
 * frontend framework and build tool.
 *
 * Security checks performed:
 *   - Scans all npm scripts for dangerous shell patterns (rm -rf, curl|bash, eval, etc.).
 *   - Blocks scripts that reference shell script files (.sh, .bat, .ps1).
 *   - Warns (but does not block) on lifecycle hooks: postinstall, preinstall, prepare.
 *
 * @param {string} dir     - Absolute path to the directory containing package.json.
 * @param {string} rootDir - Relative root directory (used in error messages only).
 * @returns {Promise<{ framework: string, tool: string }>}
 * @throws {ContainerError} If package.json is missing or contains suspicious scripts
 *                          (cancelled = true so the deployment is marked CANCELLED).
 */
async function validatePackageJsonAndGetFramework(dir, rootDir) {
	const packageJsonPath = path.join(dir, "package.json")
	if (userSettings.treatAsGenericProject) {
		return {
			framework: "static",
			tool: ""
		}
	}
	if (!existsSync(packageJsonPath)) {
		throw new ContainerError(`package.json not found in ${rootDir}`, "file validation", "", true);
	}

	const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"))

	const suspiciousPatterns = [
		/rm\s+-rf/,
		/curl.*bash/,
		/wget.*bash/,
		/eval/,
		/exec/,
		/child_process/
	]
	const notAllowedCommands = [
		'curl', 'wget', 'Invoke-WebRequest', 'certutil',
		'rm -rf', 'rmdir', 'del ', 'format ', 'mkfs', 'chmod', 'chown',
		'scp', 'ftp', 'base64', 'eval(', 'spawn(', 'exec(', 'shutdown',
		'sudo', 'dd if=', 'mkfs', 'tar -cf /', 'nc ', 'netcat'
	];


	const scripts = packageJson.scripts || {}
	for (const [name, script] of Object.entries(scripts)) {
		const trimmed = script.trim()
		for (const pattern of suspiciousPatterns) {
			if (pattern.test(trimmed)) {

				throw new ContainerError(`Suspicious script detected: ${name}`, "file validation", "Invalid Package.json file", true);
			}
		}
		for (const command of notAllowedCommands) {
			if (trimmed.toLowerCase().includes(command.toLowerCase())) {

				throw new ContainerError(`Suspicious script detected: ${name}`, "file validation", "Invalid Package.json file", true);
			}
		}

		const match = trimmed.match(/(\.\/[^\s]+\.sh|\w+\.sh|\w+\.bat|\w+\.ps1)/);
		if (match) {
			throw new ContainerError(`Suspicious script detected: ${name}: ${trimmed}`, "file validation", "Invalid Package.json file", true);
		}
	}
	const havePostinstall = scripts.hasOwnProperty("postinstall")
	const havePreinstall = scripts.hasOwnProperty("preinstall")
	const havePrepare = scripts.hasOwnProperty("prepare")

	if (havePostinstall || havePreinstall || havePrepare) {
		// report
		console.log("Detected ");
		[
			{ msg: repeat(" ", 10), state: logValues.DECOR },
			{
				msg: `⚠️ \x1b[38;5;214m  Warning: lifecycle install scripts detected in package.json \x1b[0m`,
				state: logValues.WARN
			},
		].map(({ msg, state }) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: state,
			message: msg, stream: "file validation"
		}));

		if (havePostinstall) {
			publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.WARN,
				message: `⚠️ \x1b[38;5;214m  Warning: "postinstall" script detected.
The postinstall script runs automatically during npm install and may affect build behavior.
If your build fails, ensure this script is required for your project. \x1b[0m`, stream: "file validation"
			});
		}
		if (havePreinstall) {
			publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.WARN,
				message: `⚠️ \x1b[38;5;214m  Warning: "preinstall" script detected. Preinstall scripts run before dependencies are installed and can modify the environment. Review this script carefully. \x1b[0m`, stream: "file validation"
			});
		}

		if (havePrepare) {
			publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.WARN,
				message: `⚠️ \x1b[38;5;214m Warning: "prepare" script detected. Prepare scripts may run during install and publish steps. This is common but can cause unexpected behavior in CI. \x1b[0m`, stream: "file validation"
			});
		};

		[
			{
				msg: ` Tip: Most frontend projects do not require install-time scripts.
			If this script is only used locally, consider removing it for CI compatibility.`, state: logValues.INFO
			},
			{ msg: repeat(" ", 10), state: logValues.DECOR },
		].map(({ msg, state }) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: state,
			message: msg, stream: "file validation"
		}));
	}
	console.log("All cleared..")

	return detectFrontendBuildConfig(packageJson)
}

/**
 * Forcefully terminates a child process and its entire process group.
 * Sends SIGTERM first, then SIGKILL after 5 seconds if the process is still alive.
 *
 * @param {import('execa').ExecaChildProcess} proc - The child process to kill.
 */
function killProcess(proc) {
	if (!proc || proc.killed) return;

	try {
		process.kill(-proc.pid, 'SIGTERM');
		setTimeout(() => {
			if (!proc.killed) {
				process.kill(-proc.pid, 'SIGKILL');
			}
		}, 5000);
	} catch (err) {
		console.error("Error killing process:", err);
	}
}


// Reference to the currently running child process. Stored so that the
// shutdown handler can kill it if the container receives SIGTERM/SIGINT.
let currentProcess = null
/**
 * Runs a system command as a child process.
 *
 * @param {string} command - The executable or command to run (e.g., "node", "git").
 * @param {string[]} args - List of command arguments.
 * @param {string} cwd - The working directory to run the command in.
 * @param {{name: string, value: string}[]} [env=[]] - Additional environment variables to include as array of object with name and value as strings.
 * @returns {Promise<void>} Resolves when the command finishes, rejects on error.
 */
async function runCommand(command, args, cwd, env = [], timeout = 15) {
	if (!settings.runCommands) {
		console.log("Skipping run command")
		return
	}
	const envVars = Object.fromEntries(env.map((e) => [e.name, e.value]))
	try {
		const subprocess = execa(command, args, {
			cwd,
			env: {
				...process.env,
				...envVars,
			},
			shell: process.platform === "win32",
			timeout: (Number(timeout) || 15) * 60 * 1000,
			all: false,
		});
		currentProcess = subprocess;
		subprocess.stdout?.on("data", (data) => {
			console.log(data.toString())
			publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.INFO,
				message: data.toString(), stream: "stdout"
			});
		});

		subprocess.stderr?.on("data", (data) => {
			console.error(data.toString());
			publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.ERROR,
				message: data.toString(), stream: "stderr"
			});
		});
		await subprocess;
		currentProcess = null;
	} catch (error) {
		currentProcess = null;
		console.log(error)
		if (error.timedOut) {
			publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.ERROR,
				message: `${command} timed out`, stream: "stderr"
			})
			throw new ContainerError(
				`${command} timed out after 15 minutes`,
				"stderr"
			);
		}

		if (error.signal) {
			publishLogs({
				DEPLOYMENT_ID,
				PROJECT_ID,
				level: logValues.ERROR,
				message: `${command} terminated by ${error.signal}`,
				stream: "stderr",
			});
			throw new ContainerError(
				`${command} was terminated by signal ${error.signal}`,
				"stderr"
			);
		}

		if (typeof error.exitCode === "number") {
			publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.ERROR,
				message: `${command} exited with code ${error.exitCode}`, stream: "stderr"
			})
			throw new ContainerError(
				`${command} exited with code ${error.exitCode}`,
				"stderr"
			);
		}
		publishLogs({
			DEPLOYMENT_ID,
			PROJECT_ID,
			level: logValues.ERROR,
			message: error.message,
			stream: "stderr",
		});
		throw new ContainerError(
			`Failed to start ${command}: ${error.message}`,
			"stderr"
		);
	}
}

/**
 * Uploads a zip archive of the build output to a non-S3 (local) storage server.
 * Only active when settings.sendLocalDeploy is true; used for development/testing.
 *
 * @param {string} dir      - Directory containing the zip file.
 * @param {string} fileName - Name of the zip file to upload.
 * @throws {ContainerError} If the upload request fails.
 */
async function uploadNonAws(dir, fileName) {

	if (!settings.sendLocalDeploy) return
	const url = process.env.STORAGE_SERVER_ENDPOINT || ""
	if (!url && settings.localDeploy) {
		throw new ContainerError("Storage server not reachable", "upload")
	}
	const zipStream = createReadStream(path.join(dir, fileName));
	const form = new FormData();
	form.append("file", zipStream, {
		filename: "build.zip",
		contentType: "application/zip"
	})
	try {
		const res = await axios.post(url + `/new/${PROJECT_ID}/${DEPLOYMENT_ID}`, form,
			{
				timeout: 24000,
				headers: {
					Authorization: `Bearer ${API_SERVER_CONTAINER_API_TOKEN}`,
					...form.getHeaders()
				},
				maxContentLength: Infinity,
				maxBodyLength: Infinity
			}
		)
		const result = res.data

		return
	} catch (error) {
		console.log("Error on uploading files", error)
		publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.ERROR,
			message: `Error on uploading files, ${error.message}`,
			stream: "upload"
		});
		throw new ContainerError("Storage server not reachable  " + error.message, "upload", "Storage server not reachable")
	}

}
/**
 * Glob-style patterns for files and directories that should never be included
 * in the build output upload. Patterns with "*" are treated as wildcards.
 */
const EXCLUDE_PATTERNS = [
	'node_modules',
	'.git',
	'.gitignore',
	'.gitattributes',
	'tmp',
	'*.temp',
	'*.bak',
	".next/cache",
	'.env',
	'.env.local',
	'.env.*.local',
	'coverage',
	".turbo",
	'.cache',
	'__pycache__',
	'.vscode',
	'*.sublime-project',
	'*.sublime-workspace',
	'*.code-workspace',
	'.idea',
	'*.log',
	'.DS_Store',
	'Thumbs.db',
	'*.log',
	'coverage',
	'test-results',
	'*.lcov',
	'*.swp',
	'*.swo',
	'*.pid',
	'*.seed',
];
// Upload size limits enforced before and during the S3 upload phase.
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB per file
const MAX_TOTAL_SIZE = 280 * 1024 * 1024; // 280MB total
const WARN_MAX_TOTAL_SIZE = 80 * 1024 * 1024; // give warning on this limit
const MAX_NO_OF_FILES = 1000
/**
 * Returns true if a file or directory should be excluded from the upload.
 * Checks both the entry name and its relative path against EXCLUDE_PATTERNS.
 *
 * @param {string} entryName - The file or directory name (basename).
 * @param {string} relPath   - The path relative to the output directory root.
 * @returns {boolean}
 */
function shouldExcludeDir(entryName = "", relPath = "") {
	for (const pattern of EXCLUDE_PATTERNS) {
		if (pattern.includes('*')) {
			const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
			if (regex.test(entryName)) return true;
		}
		else {
			if (entryName === pattern || relPath.split(path.sep).includes(pattern)) {
				return true
			}
		}
	}
	return false;
}
/**
 * Validates the build output directory before uploading.
 *
 * Walks the directory tree and enforces:
 *   - No individual file exceeds MAX_FILE_SIZE (20 MB).
 *   - Total file count does not exceed MAX_NO_OF_FILES (1000).
 *   - Total size does not exceed MAX_TOTAL_SIZE (280 MB).
 *   - Warns (but does not fail) when total size exceeds WARN_MAX_TOTAL_SIZE (80 MB).
 *
 * This is a dry-run pass; no files are uploaded here.
 *
 * @param {string} sourceDir - Absolute path to the build output directory.
 * @throws {ContainerError} On any limit violation (cancelled = true).
 */
async function validateBuilds(sourceDir) {
	const fileStructure = []
	let totalSize = 0;
	let warned = false;
	async function processDirectory(currentDir, relativePath = "") {
		const entries = await readdir(currentDir, { withFileTypes: true })
		for (const entry of entries) {
			const fullPath = path.join(currentDir, entry.name)
			const relPath = path.join(relativePath, entry.name)

			if (shouldExcludeDir(entry.name, relPath)) {
				console.log("Skipping ---- ------- ", relPath)
				continue;
			}
			if (entry.isDirectory()) {
				await processDirectory(fullPath, relPath);

			} else if (entry.isFile()) {
				const fileStat = await stat(fullPath);
				if (fileStat.size > MAX_FILE_SIZE) {
					publishLogs({
						DEPLOYMENT_ID, PROJECT_ID,
						level: logValues.ERROR,
						message: `\x1b[38;5;9m File too large - (${(fileStat.size / 1024 / 1024).toFixed(2)} MB): ${relPath} \x1b[0m`,
						stream: "upload"
					});
					publishLogs({
						DEPLOYMENT_ID, PROJECT_ID,
						level: logValues.ERROR,
						message: `\x1b[38;5;9m Build fail - ${relPath}  \x1b[0m`,
						stream: "upload"
					});
					throw new ContainerError(
						`File "${relPath}" exceeds the maximum allowed size of ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)} MB.`,
						"upload",
						"Output file size limit exceeded",
						true
					)
					continue;
				}

				fileStructure.push({ name: relPath, size: fileStat.size });
				if (fileStructure.length > MAX_NO_OF_FILES) {
					publishLogs({
						DEPLOYMENT_ID,
						PROJECT_ID,
						level: logValues.ERROR,
						message: `\x1b[38;5;9m Error -> Total files exceeded ${MAX_NO_OF_FILES}. Possible node_modules or cache directory in build output? \x1b[0m`,
						stream: "upload"
					});

					throw new ContainerError(
						`Total number of output files exceeded the limit of ${MAX_NO_OF_FILES}.`,
						"upload",
						"Output files count limit exceeded",
						true
					);
				}
				totalSize += fileStat.size;
				if (!warned && totalSize > WARN_MAX_TOTAL_SIZE) {
					warned = true
					publishLogs({
						DEPLOYMENT_ID, PROJECT_ID,
						level: logValues.WARN,
						message: `\x1b[38;5;214m Warning -> Large build size (${(totalSize / 1024 / 1024).toFixed(1)}MB). Verify output directory. \x1b[0m`,
						stream: "upload"
					});
				}
				if (totalSize > MAX_TOTAL_SIZE) {
					publishLogs({
						DEPLOYMENT_ID, PROJECT_ID,
						level: logValues.ERROR,
						message: `\x1b[38;5;9m Error -> Total size exceeded ${(MAX_TOTAL_SIZE / 1024 / 1024).toFixed(2)} MB. Possible node_modules in build directory? \x1b[0m`,
						stream: "upload"
					});
					throw new ContainerError(`Total size exceeded ${(MAX_TOTAL_SIZE / 1024 / 1024).toFixed(2)} MB.`, "upload", "Output files Total size exceeded", true)
				}
			}
		}
	}
	await processDirectory(sourceDir);
}
/**
 * Uploads all build output files to S3 (or a local storage server in dev mode).
 *
 * For S3 uploads:
 *   - Files are uploaded concurrently, limited to 8 parallel operations (pLimit).
 *   - Each file is stored under the key:
 *     `__app_build_outputs/<PROJECT_ID>/<DEPLOYMENT_ID>/<relPath>`.
 *   - The correct Content-Type is set using mime-types.
 *
 * For local (non-S3) uploads:
 *   - All files are first archived into a zip file using archiver.
 *   - The zip is then POSTed to the local storage server via uploadNonAws().
 *
 * Excluded files (node_modules, .git, etc.) are skipped and logged.
 * Path-traversal attempts are detected and skipped with a warning.
 *
 * @param {string} sourceDir - Absolute path to the validated build output directory.
 * @returns {Promise<{ fileStructure: {name: string, size: number}[], totalSize: number }>}
 * @throws {ContainerError} On upload failure or size/count limit violations.
 */
async function uploadOutputFiles(sourceDir) {

	// ====================================================================
	// only for non cloud uploads, Use test server as non cloud upload.
	// we make it into zip and upload to storage server, then upzip it there,
	// skip if not doing non cloud upload
	const zipFileName = "output__" + Math.random().toString(36).slice(2, 12).replaceAll(".", "") + ".zip"

	const output = createWriteStream(path.join(sourceDir, zipFileName));
	const archive = archiver('zip', {
		zlib: { level: 9 }
	});

	archive.pipe(output);
	// ====================================================================

	const uploadsArray = []
	const fileStructure = []
	let totalSize = 0;
	const skippedArtifacts = []
	async function processDirectory(currentDir, relativePath = "") {
		const entries = await readdir(currentDir, { withFileTypes: true })
		for (const entry of entries) {
			const fullPath = path.join(currentDir, entry.name)
			const relPath = path.join(relativePath, entry.name)

			if (shouldExcludeDir(entry.name, relPath)) {
				console.log("Skipping ----------- ", relPath)
				skippedArtifacts.push(relPath)
				continue;
			}
			if (entry.isDirectory()) {
				await processDirectory(fullPath, relPath);

			} else if (entry.isFile()) {
				const fileStat = await stat(fullPath);
				const normalizedPath = path.normalize(fullPath);
				if (!normalizedPath.startsWith(sourceDir)) {
					console.warn(`Skipping suspicious file path: ${relPath}`);
					publishLogs({
						DEPLOYMENT_ID, PROJECT_ID,
						level: logValues.WARN,
						message: `\x1b[38;5;214m Suspicious file path detected ${relPath} \x1b[0m`,
						stream: "upload"
					});
					publishLogs({
						DEPLOYMENT_ID, PROJECT_ID,
						level: logValues.WARN,
						message: `\x1b[38;5;214m Skipping suspicious file path: ${relPath} \x1b[0m`,
						stream: "upload"
					});
					continue;
				}
				if (fileStat.size > MAX_FILE_SIZE) {
					throw new ContainerError(
						`File "${relPath}" exceeds the maximum allowed size of ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)} MB.`,
						"upload",
						"Output file size limit exceeded",
						true
					)
					continue;
				}

				fileStructure.push({ name: relPath, size: fileStat.size });
				totalSize += fileStat.size;
				if (fileStructure.length > MAX_NO_OF_FILES) {
					throw new ContainerError(
						`Total number of output files exceeded the limit of ${MAX_NO_OF_FILES}.`,
						"upload",
						"Output files count limit exceeded",
						true
					);
				}
				if (!settings.uploadArtifacts) {
					continue
				}
				if (totalSize > MAX_TOTAL_SIZE) {
					throw new ContainerError(`Total size exceeded ${(MAX_TOTAL_SIZE / 1024 / 1024).toFixed(2)} MB.`, "upload", "Output files Total size exceeded", true)
				}
				if (settings.localDeploy) {
					publishLogs({
						DEPLOYMENT_ID, PROJECT_ID,
						level: logValues.INFO,
						message: "\x1b[38;5;48m uploading " + relPath + "\x1b[0m",
						stream: "upload"
					});
					archive.file(fullPath, { name: relPath });

				} else {
					uploadsArray.push(limit(async () => {
						publishLogs({
							DEPLOYMENT_ID, PROJECT_ID,
							level: logValues.INFO,
							message: "uploading \x1b[38;5;48m " + relPath + "\x1b[0m",
							stream: "system"
						});
						console.log("Uploading " + relPath, "--cloud");
						const command = new PutObjectCommand({
							Bucket: BUCKET_NAME,
							Key: `__app_build_outputs/${PROJECT_ID}/${DEPLOYMENT_ID}/${relPath.replaceAll("\\", "/")}`,
							Body: createReadStream(fullPath),
							ContentType: mime.lookup(fullPath)
						});
						await s3Client.send(command);
					}))
				}
			}
		}
	}
	await processDirectory(sourceDir);
	try {
		await Promise.all(uploadsArray);
		if (skippedArtifacts.length) {
			console.log(`Skipped ${skippedArtifacts.length} items`);
			publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.WARN,
				message: "Items skipped  => \x1b[38;5;220m " + skippedArtifacts.join(", ") + "\x1b[0m",
				stream: "upload"
			});
		}
	} catch (error) {
		console.log(error)
		throw new ContainerError("Error on File upload", "upload",)
	}
	await archive.finalize();
	return new Promise((resolve, reject) => {
		output.on("finish", async () => {
			try {
				await uploadNonAws(sourceDir, zipFileName) // skips internally with settings.sendLocalDeploy
				resolve({ fileStructure, totalSize })
			} catch (err) {
				reject(err)
			}
		});
		output.on("error", reject);
		archive.on("error", reject);
	});
	return { fileStructure, totalSize };
}

/**
 * Extracts the GitHub owner and repository name from a repository URL.
 *
 * @param {string} repoURL - The full repository URL (HTTPS or SSH).
 * @returns {{ owner: string, repo: string } | null} Parsed owner/repo, or null
 *          if the URL is falsy.
 */
function getRepoInfo(repoURL) {
	if (!repoURL) return null;
	const cleaned = repoURL.replace(/\.git$/, "").replace(/\/$/, "");
	const parts = cleaned.split("/");
	const repo = parts.pop();
	const owner = parts.pop();
	return { owner, repo };
}

/**
 * Creates a GitHub Check Run and marks it as "in_progress" at the start of a build.
 *
 * If the commit SHA is not already known (e.g. for manual re-deploys), it is
 * fetched from the GitHub API using the branch name.
 *
 * Only runs for GitHub-hosted projects with a valid installation access token.
 *
 * @param {object} project          - Project document from the API server.
 * @param {string} [commitAvailble] - Pre-known commit SHA (optional).
 * @returns {Promise<number|undefined>} The GitHub Check Run ID, or undefined on failure.
 */
async function sendDeploymentGithubStatusStart(project, commitAvailble = "") {
	if (!settings.githubCheckRuns.sendStart) return console.log("\nCancelled check runs start\n");
	const installAccessToken = process.env.INSTALLATION_ACCESS_TOKEN.replace(/\r$/, "")

	const githubHeadersCommon = {
		Authorization: `Bearer ${installAccessToken}`,
		Accept: "application/vnd.github+json",
	}
	try {
		const userWithRepo = getRepoInfo(project.repoURL)
		const owner = userWithRepo.owner
		const repo = userWithRepo.repo
		if (project.provider !== 'GITHUB' || !installAccessToken || !owner || !repo) {
			return undefined
		}
		console.log("Updating github check run 'start'");
		let commitLatest = commitAvailble
		if (!commitAvailble) {
			console.log("Github checks; No commit found; Fetching commit...");
			const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits/${project.branch}`, {
				headers: {
					...githubHeadersCommon,
					"Content-Type": "application/json",
				}
			})
			commitLatest = response.data.sha
			console.log("commit", commitLatest, "from new fetch \n")
		}

		const response = await axios.post(`https://api.github.com/repos/${owner}/${repo}/check-runs`,
			{
				name: brandName,
				head_sha: commitLatest,
				status: "in_progress",
			}, {
			headers: {
				...githubHeadersCommon,
				"Content-Type": "application/json",
			}
		});
		const data = response.data;
		const checkId = data.id;
		return checkId
	} catch (error) {
		console.log("Error on updating github check runs 'start'", error?.response?.data || error.message)
		return undefined
	}
}

/**
 * Completes the GitHub Check Run created by sendDeploymentGithubStatusStart().
 *
 * Sets the conclusion to "success" or "failure"/"cancelled" depending on
 * whether the build succeeded. Errors from the GitHub API are logged but
 * never propagated — a GitHub reporting failure must not fail the deployment.
 *
 * @param {object} project                    - Project document from the API server.
 * @param {{ checkId: number }} meta           - Object containing the Check Run ID.
 * @param {object} errorData
 * @param {string} errorData.conclusion        - GitHub conclusion string ("success"|"failure"|"cancelled").
 * @param {boolean} errorData.isError          - Whether the build ended in error.
 * @param {string} [errorData.errorMessage]    - Human-readable error description for the Check Run summary.
 */
async function sendDeploymentGithubStatusStop(project, meta = { checkId: 0 }, errorData = {
	conslusion: "", errorMessage: "", errorSummary: "", isError: false,
}) {
	if (!settings.githubCheckRuns.sendStop) return console.log("\nCancelled check runs stop\n");
	console.log("Check runs :: deployment status ->", errorData.isError ? "error" : "success");

	const { checkId } = meta
	if (!projectData || !checkId) {
		return
	}
	const installAccessToken = process.env.INSTALLATION_ACCESS_TOKEN.replace(/\r$/, "");
	try {
		const userWithRepo = getRepoInfo(project.repoURL)
		const owner = userWithRepo.owner
		const repo = userWithRepo.repo

		if (projectData.provider !== 'GITHUB' || !installAccessToken || !owner || !repo) {
			return
		}

		console.log("Updating github check run 'complete'");
		const { conclusion, isError, errorMessage } = errorData

		await axios.patch(`https://api.github.com/repos/${owner}/${repo}/check-runs/${checkId}`, {
			name: brandName,
			status: "completed",
			conclusion,
			output: {
				title: `${brandName} Deployment completed${isError ? " with errors" : ""}.`,
				summary: errorMessage || "",
			}
		}, {
			headers: {
				Authorization: `Bearer ${installAccessToken}`,
				Accept: "application/vnd.github+json",
				"Content-Type": "application/json",
			}
		})

	} catch (error) {
		console.log("Error on updating github check runs 'stop' :: ", error?.response?.data || error.message)
		return
	}
}

// --------------------------------------------------------MAIN_TASK--------------------------------------------------

// Module-level references to the resolved project document and user ID.
// Set during init() so that the error handler can access them even if the
// error occurs before the local variables are in scope.
let projectData = null
let projectUser = ""

/**
 * Main build orchestration function.
 *
 * Executes the full deployment pipeline in order:
 *   1. Connects the Kafka producer and publishes a START update.
 *   2. Fetches project and deployment data from the API server.
 *   3. Creates a GitHub Check Run (in_progress).
 *   4. Clones the Git repository.
 *   5. Reads the latest commit hash from the clone.
 *   6. Merges server and user environment variables.
 *   7. Validates package.json and detects the framework.
 *   8. Runs npm install (with retry logic).
 *   9. Runs npm run build.
 *  10. Validates the build output directory.
 *  11. Uploads output files to S3.
 *  12. Publishes an END update with timing metrics and file structure.
 *  13. Completes the GitHub Check Run.
 *
 * On any ContainerError the error is reported to Kafka and GitHub, and the
 * deployment is marked FAILED or CANCELLED. Unexpected errors are reported
 * as "Internal server error".
 *
 * The finally block always flushes remaining logs and disconnects Kafka.
 */
async function init() {

	if (settings.sendKafkaMessage) {
		await kafkaProducer.connect();
	};
	await publishUpdates({
		DEPLOYMENT_ID, PROJECT_ID,
		type: "START",
		commit_hash: gitCommitData,
		status: deploymentStatus.BUILDING
	});
	const timerStart = performance.now();


	["\x1b[38;5;153m\x1b[3;2m" + repeat("-", 60) + "\x1b[38;5;153m\x1b[3;2m BEGIN " + "\x1b[38;5;153m\x1b[3;2m" + repeat("-", 150) + "\x1b[0m", repeat(" ", 100)].map((v) => publishLogs({
		DEPLOYMENT_ID, PROJECT_ID,
		level: logValues.DECOR,
		message: v, stream: "system"
	}));

	publishLogs({
		DEPLOYMENT_ID, PROJECT_ID,
		level: logValues.INFO,
		message: "Starting deployment..", stream: "system"
	})
	let githubCheckId = null;
	let gitCommitSha = gitCommitData.split("||")[0];
	try {
		//logs
		console.log("Executing script.js");

		console.log("Fetching project data");
		const [project, deploymentData] = await fetchProjectData(DEPLOYMENT_ID);

		githubCheckId = await sendDeploymentGithubStatusStart(project,
			deploymentData.triggerEvent !== "GIT_PUSH" ?
				(deploymentData.commit.id === "----" ? "" : deploymentData.commit.id)
				: ""
		)


		const taskDir = path.join(__dirname, "./output/");            // UPDATE THIS ON DEPLOYMENT !!!!!!!!!!!!!!!!!
		["Directory set to " + taskDir, "Fetching project data "].map((v) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.INFO,
			message: `${v}`, stream: "system"
		}));

		//-----------------------------------------CLONING_FETCHING-----------------------------------------------------------------------------------------------------


		projectData = project;
		projectUser = project.user;
		DEPLOYMENT_ID = deploymentData._id;
		PROJECT_ID = projectData._id;

		const installCommand = "install";
		const buildCommand = projectData.buildCommand || "build";

		const relativeOutput = projectData.outputDirectory || "dist";
		const nestedOutputPath = path.join(projectData.rootDir || "", relativeOutput);
		const runDirDisplay = path.join(taskDir, projectData.rootDir); // to display in logs

		const cleanedPaths = validateDirectories(taskDir, projectData.rootDir, nestedOutputPath);
		const outputFilesDirDisplay = projectData.outputDirectory; // to display in logs
		const runDir = cleanedPaths.sourceDir;
		const distFolderPath = cleanedPaths.outputDir;

		publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.INFO,
			message: `cloning repo..`, stream: "system"
		});

		await cloneGitRepoAndValidate(taskDir, runDir, projectData);
		gitCommitData = await getGitCommitData(taskDir).catch((e) => console.log("Error getting commit", e)) || gitCommitData;
		gitCommitSha = gitCommitData.split("||")[0];

		publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.INFO,
			message: `git repo cloned...`, stream: "system"
		});



		const { finalEnvsBuild, finalEnvsInstall } = getBuildServerEnvsWithUserEnvs(projectData.env ?? [], {
			project: projectData,
			deployment: deploymentData,
			gitData: gitCommitData,
		});
		// console.log({ userSettings })


		const framweworkIdentified = await validatePackageJsonAndGetFramework(runDir, projectData.rootDir);
		const buildOptions = getDynamicBuildRoot(framweworkIdentified.tool);

		["Detected 1 framework", "Framework " + framweworkIdentified.framework + " identified",
			repeat(" ", 10), "\x1b[38;5;153m\x1b[3;2m" + repeat("-", 60) + "\x1b[38;5;153m\x1b[3;2m INSTALL " + "\x1b[38;5;153m\x1b[3;2m" + repeat("-", 150) + "\x1b[0m", repeat(" ", 10)].map((v) => publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.DECOR,
				message: v, stream: "system"
			}))
		printInfoLogs();

		//-----------------------------------------------------------INSTALL-------------------------------------------------------------------------------------------


		let installTries = 0
		let maxInstallTries = (userSettings.maxInstallTries && userSettings.maxInstallTries > 0 && userSettings.maxInstallTries < 3) ? userSettings.maxInstallTries : 3
		const installTimer = performance.now()
		let installDuration = 0
		if (userSettings.skipInstall) {
			installTries = 4;
			maxInstallTries = 0;
			["\x1b[\x1b[1m\x1b[38;2;39;199;255m Skipping install step \x1b[0m", line(36)
			].map((v) => publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.INFO,
				message: v, stream: "system"
			}))
		} else {
			["\x1b[\x1b[1m\x1b[38;2;39;199;255m Installing packages...\x1b[0m", line(36)
			].map((v) => publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.DECOR,
				message: v, stream: "system"
			}))

			while (installTries < maxInstallTries) {
				console.log("trying install ", installTries)
				const extraFlags =
					installTries === 1
						? ["--legacy-peer-deps"]
						: installTries >= 2
							? ["--force"]
							: []
				try {
					publishLogs({
						DEPLOYMENT_ID, PROJECT_ID,
						level: logValues.INFO,
						message: `\x1b[38;5;123m Installing with command $ npm ${installCommand} ${extraFlags.join(" ")}\x1b[0m`, stream: "system"
					})
					await runCommand("npm", [...installCommand.split(" "), ...extraFlags], runDir, finalEnvsInstall ?? [], 10)
					break
				} catch (error) {
					installTries++;
					publishLogs({
						DEPLOYMENT_ID, PROJECT_ID,
						level: logValues.WARN,
						message: `\x1b[38;5;220m Failed to install with command 'npm ${installCommand}' ${extraFlags.join(" ")} \x1b[0m`, stream: "system"
					})
					if (installTries >= maxInstallTries) throw error;

					[`---------------    Retrying install    -------------`,
						`---------------    Try No. ${installTries}    -------------`
					].map((v) => publishLogs({
						DEPLOYMENT_ID, PROJECT_ID,
						level: logValues.WARN,
						message: v, stream: "system"
					}));
					await new Promise(r => setTimeout(r, 2000));
				}
			}
			const installEndTimer = performance.now()
			installDuration = (installEndTimer - installTimer)
			console.log('Dependencies installed successfully in ', (installDuration / 1000).toFixed(2), " seconds");

			publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.DECOR,
				message: repeat(" ", 25), stream: "system"
			});

			[
				"\x1b[38;5;123m Install Success\x1b[0m",
				`Dependencies installed successfully  in ${(installDuration / 1000).toFixed(2)} seconds`
			].map((v) => publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.SUCCESS,
				message: v, stream: "system"
			}))
		}





		//-----------------------------------------BUILD---------------------------------------------------------------------------------------------------------




		const buildTimer = performance.now();

		[
			{ msg: repeat(" ", 10), state: logValues.DECOR },
			{ msg: "\x1b[38;5;153m\x1b[3;2m" + repeat("-", 60) + "\x1b[38;5;153m\x1b[3;2m BUILD " + "\x1b[38;5;153m\x1b[3;2m" + repeat("-", 150) + "\x1b[0m", state: logValues.DECOR },
			{ msg: repeat(" ", 10), state: logValues.DECOR },
			...(userSettings.skipBuild
				? [
					{ msg: "Skipping build step", state: logValues.INFO },
					{ msg: `\x1b[1m\x1b[38;2;39;199;255m Skipping build step \x1b[0m`, state: logValues.DECOR }
				]
				: [
					{ msg: `\x1b[1m\x1b[38;2;39;199;255m ${brandName} Build...\x1b[0m`, state: logValues.DECOR },
					{ msg: "Starting build", state: logValues.INFO },
					{ msg: line(36), state: logValues.DECOR },
					{ msg: "\x1b[38;5;123m Building with command $ npm run \x1b[38;5;220m" + buildCommand + "\x1b[0m", state: logValues.INFO }
				]
			),
		].map(({ msg, state }) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: state,
			message: msg, stream: "system"
		}));
		let buildTries = 0
		while (buildTries < 1) {
			if (userSettings.skipBuild) {
				break
			}
			buildTries++;
			await runCommand(
				"npm",
				["run", ...buildCommand.split(" "), ...((settings.customBuildPath && framweworkIdentified.tool.toLowerCase() !== "cra") ? ["--", buildOptions] : [])],
				runDir,
				(framweworkIdentified.tool.toLowerCase() === "cra" && settings.customBuildPath)
					? [...(finalEnvsBuild || []), { name: "PUBLIC_URL", value: "." }]
					: [...finalEnvsBuild]
			)
		}

		const buildEndTimer = performance.now();
		console.log("Build complete ", ((buildEndTimer - buildTimer) / 1000).toFixed(2), " seconds");
		[
			{ msg: repeat(" ", 25), state: logValues.INFO },
			...(!userSettings.skipBuild ? [
				{ msg: "\x1b[38;5;123m Build Success\x1b[0m", state: logValues.SUCCESS },
				{
					msg: `Build complete in ${((buildEndTimer - buildTimer) / 1000).toFixed(2)} seconds`,
					state: logValues.SUCCESS
				},
				{ msg: repeat(" ", 25), state: logValues.INFO },
				{ msg: "Validating build files", state: logValues.INFO }
			] : []
			)
		].map(({ msg, state }) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: state,
			message: msg, stream: "system"
		}))


		if (!existsSync(distFolderPath)) {
			publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.ERROR,
				message: `\x1b[38;5;9m ERROR -> Output not found ${userSettings.skipBuild ? "" : "after build"}; Wrong output directory? \x1b[0m`,
				stream: "upload"
			});
			throw new ContainerError(outputFilesDirDisplay + ` folder not found ${userSettings.skipBuild ? "" : "after build"}`,
				"system",
				`Output not found ${userSettings.skipBuild ? "" : "after build"}`
			);
		}
		console.log("done.....");
		console.log("Post build configurations running....");

		[
			{ msg: "File validation done ", state: logValues.SUCCESS },
			{ msg: "Post build configurations running....", state: logValues.INFO },
			{ msg: repeat(" ", 10), state: logValues.DECOR },
			{ msg: "\x1b[38;5;153m\x1b[3;2m" + repeat("-", 60) + "\x1b[38;5;153m\x1b[3;2m UPLOAD " + "\x1b[38;5;153m\x1b[3;2m" + repeat("-", 150) + "\x1b[0m", state: logValues.DECOR },
			{ msg: repeat(" ", 10), state: logValues.DECOR },
			{ msg: "Starting to Uploading files...", state: logValues.INFO },
			{ msg: "Validating build output files", state: logValues.INFO }

		].map(({ msg, state }) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: state,
			message: msg, stream: "system"
		}))



		//-----------------------------------------UPLOAD---------------------------------------------------------------------------------------------------------


		const uploadTimer = performance.now()
		await validateBuilds(distFolderPath);
		console.log("Validation success");
		[repeat(" ", 10), "Files validated", repeat(" ", 10),].map((v) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.INFO,
			message: v, stream: "system"
		}));
		const { fileStructure, totalSize } = await uploadOutputFiles(distFolderPath)

		if (settings.localDeploy && settings.deleteSourcesAfter) {
			await rm(taskDir, { recursive: true, force: true });
			await mkdir(taskDir, { recursive: true });
		}
		const uploadEndTimer = performance.now()

		const timerEnd = performance.now();
		const durationMs = timerEnd - timerStart;

		publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.INFO,
			message: "Upload Complete", stream: "system"
		});

		[repeat(" ", 10), "\x1b[38;5;153m\x1b[3;2m" + repeat("-", 60) + "\x1b[38;5;153m\x1b[3;2m END " + "\x1b[38;5;153m\x1b[3;2m" + repeat("-", 150) + "\x1b[0m",
		repeat(" ", 10),
		].map((v) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.DECOR,
			message: v, stream: "system"
		}));



		["Deployment Done ...🎉", "Task done in " + (durationMs / 1000).toFixed(2) + " seconds🎉",
			`Site live at \x1B[1;36mhttps://${projectData.subdomain}.....\x1B[0m 🎉🎉🎉`
		].map((v) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.SUCCESS,
			message: v, stream: "system"
		}))

		await sendDeploymentGithubStatusStop(projectData, { commitLatest: gitCommitSha, checkId: githubCheckId }, { conclusion: "success", isError: false, });
		await publishUpdates({
			DEPLOYMENT_ID, PROJECT_ID,
			type: "END",
			status: deploymentStatus.READY,
			user: projectData.user,
			techStack: userSettings.frameworkSetByUser || framweworkIdentified.framework,
			install_ms: Number(installDuration.toFixed(2)),
			build_ms: Number((buildEndTimer - buildTimer).toFixed(2)),
			upload_ms: Number((uploadEndTimer - uploadTimer).toFixed(2)),
			duration_ms: Number(durationMs.toFixed(2)),
			commit_hash: gitCommitData,
			complete_at: new Date().toISOString(),
			file_structure: { files: fileStructure, totalSize }
		})

		console.log("Time taken ", durationMs.toFixed(2), "logs number ", logsNumber)
		console.log("Deployment finished ...");
	} catch (err) {
		//logs
		if (err?.isContainerError || err instanceof ContainerError) {
			[`${err.message} ${err.cause ? "| " + err.cause : ""}`, "Deployment completed with errors"].map((v) => publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.ERROR,
				message: v, stream: err.stream
			})
			);

			[repeat(" ", 10), "\x1b[38;5;197m" + repeat("-", 60) + "\x1b[38;5;197m END " + "\x1b[38;5;197m" + repeat("-", 150) + "\x1b[0m",
			repeat(" ", 10),
			].map((v) => publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.DECOR,
				message: v, stream: "system"
			}));

			await sendDeploymentGithubStatusStop(projectData, { checkId: githubCheckId }, {
				isError: true,
				conclusion: err.cancelled ? "cancelled" : "failure",
				errorMessage: `${err.message} ${err.cause ? "| " + err.cause : ""}`,
			});

			await publishUpdates({
				DEPLOYMENT_ID, PROJECT_ID,
				type: "ERROR",
				user: projectUser || "",
				status: err.cancelled ? deploymentStatus.CANCELED : deploymentStatus.FAILED,
				error_message: `${err.message} ${err.cause ? "| " + err.cause : ""}`,
				complete_at: new Date().toISOString(),
				commit_hash: gitCommitData,
			})
		}
		else {
			console.log(err.message)
			publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.ERROR,
				message: `Internal Server Error`, stream: "Server"
			})

			await sendDeploymentGithubStatusStop(projectData, { checkId: githubCheckId }, {
				isError: true,
				conclusion: "failure",
				errorMessage: `${err.message} ${err.cause ? "| " + err.cause : ""}`,
			});

			await publishUpdates({
				DEPLOYMENT_ID, PROJECT_ID,
				type: "ERROR",
				status: deploymentStatus.FAILED,
				user: projectUser || "",
				error_message: "Internal server error",
				complete_at: new Date().toISOString(),
			})
		}
		console.log("Some error happened ", !(err instanceof ContainerError) ? err : "")
		console.log("Exiting in 5 seconds")
	} finally {
		await sendLogsAsBatch();
		await kafkaProducer.disconnect();
		await new Promise((res) => setTimeout(res, 5000));
	}
}


/**
 * Initialises the Kafka producer and S3 client from the provided credentials,
 * clears the credential references from memory, then starts the build pipeline.
 *
 * @param {{ kUid: string, kPass: string, aKey: string, aSecret: string, cldEndpoint: string }} external
 *   Cloud service credentials (Kafka + S3).
 * @param {{ token: string }} otherScrts - API server container token.
 */
function createClients(input) {
	const { kUid, kPass, aKey, aSecret, cldEndpoint } = input;

	const kafkaClient = new Kafka({
		clientId: `docker-build-server-${PROJECT_ID}-${DEPLOYMENT_ID}`,
		brokers: ["pkc-l7pr2.ap-south-1.aws.confluent.cloud:9092"],
		ssl: true, // or key
		sasl: {
			mechanism: "plain",
			username: kUid,
			password: kPass,
		},
	});


	const producer = kafkaClient.producer();
	const s3 = new S3Client({
		region: "auto",
		credentials: {
			accessKeyId: aKey,
			secretAccessKey: aSecret,
		},
		endpoint: cldEndpoint,
		forcePathStyle: true,
	});

	return { producer, s3 };
}
/**
 * Wires up the Kafka producer and S3 client, scrubs credentials from memory,
 * then delegates to init() to run the build pipeline.
 *
 * @param {{ kUid: string, kPass: string, aKey: string, aSecret: string, cldEndpoint: string }} external
 * @param {{ token: string }} otherScrts
 */
async function starterFunc(external, otherScrts) {
	const { producer, s3 } = createClients(external);
	kafkaProducer = producer;
	s3Client = s3;
	external = null;
	API_SERVER_CONTAINER_API_TOKEN = otherScrts.token;


	deleteEnvs()
	await init();
	console.log("--------------END-------------")
}

/**
 * Gracefully shuts down the process.
 *
 * On a clean shutdown (code 0) it disconnects Kafka and exits.
 * On an error shutdown (code != 0) it attempts to publish a FAILED update
 * to Kafka before disconnecting, so the API server is always notified.
 *
 * @param {number} [code=0]   - Exit code (0 = success, 1 = error).
 * @param {string} [reason=""] - Human-readable reason for logging.
 */
async function shutdown(code = 0, reason = "") {
	console.log("Shutdown:", reason);
	if (currentProcess) killProcess(currentProcess);
	if (code === 0) {
		if (kafkaProducer) {
			await kafkaProducer.disconnect();
		}
		process.exit(0);
		return
	}
	try {
		if (kafkaProducer) {
			await publishUpdates({
				DEPLOYMENT_ID, PROJECT_ID,
				type: "ERROR",
				status: deploymentStatus.FAILED,
				error_message: "Internal server error",
				complete_at: new Date().toISOString(),
			});
			await kafkaProducer.disconnect();
		}
	} catch (e) {
		console.error("Disconnect failed:", e);
	}
	process.exit(code);
}

process.on("SIGTERM", () => shutdown(0, "SIGTERM"));
process.on("SIGINT", () => shutdown(0, "SIGINT"));

process.on("uncaughtException", async err => {
	console.error("Fatal error:", err);
	await shutdown(1, "uncaughtException");
});

/**
 * Reads all of stdin synchronously and returns it as a UTF-8 string.
 * stdin is destroyed immediately after reading to prevent any further reads.
 *
 * @returns {string} The raw stdin content.
 */
function readStdin() {
	const input = readFileSync(0, 'utf8');
	process.stdin.destroy()
	return input
}

/**
 * Parses and validates the six newline-delimited secrets read from stdin.
 *
 * Expected order (matching main.sh printf output):
 *   1. CONTAINER_API_TOKEN
 *   2. CLOUD_ACCESSKEY
 *   3. CLOUD_SECRETKEY
 *   4. CLOUD_ENDPOINT
 *   5. KAFKA_USERNAME
 *   6. KAFKA_PASSWORD
 *
 * @param {string} input - Raw stdin string.
 * @returns {string[]} Array of exactly 6 secret strings.
 * @throws {Error} If the input does not contain exactly 6 non-empty lines.
 */
function cleanEnv(input = "") {
	const scrts = input.trimEnd().split(/\r?\n/);

	let [token, aKey, aSecret, cldEndpoint, kUid, kPass] = scrts
	let isError = false
	if (!scrts || scrts.length !== 6) {
		throw new Error("Invalid configs given, required 6, given " + scrts.length)
	}
	if (!token) {
		isError = true
		console.log(" token not found ")
	}
	if (!aKey) {
		isError = true
		console.log("access key not found ")
	}
	if (!aSecret) {
		isError = true
		console.log(" access secret not found ")
	}
	if (!cldEndpoint) {
		isError = true
		console.log("access endpoint not found ")
	}
	if (!kUid) {
		isError = true
		console.log(" kfk id  not found ")
	}
	if (!kPass) {
		isError = true
		console.log(" kpass not found ")
	}
	if (isError) {
		throw new Error("Some secrets missing")
	} else {
		console.log(" SUCCESS ")
	}
	return scrts
}

/**
 * Script entry point (IIFE).
 *
 * Reads secrets from stdin, validates them, initialises clients, and starts
 * the build pipeline. Requires stdin to be a pipe (not a TTY) — running the
 * script directly in an interactive terminal is rejected to prevent accidental
 * execution without the required secrets.
 */
(async function main() {
	try {
		if (!process.stdin.isTTY) {

			const input = readStdin();
			if (!input) {
				throw new Error("No config input given")
			}

			const scrts = cleanEnv(input)

			let [token, aKey, aSecret, cldEndpoint, kUid, kPass] = scrts

			// const externalScrts = { aKey: process.env.CLOUD_ACCESSKEY, aSecret: process.env.CLOUD_SECRETKEY, kUid: process.env.KAFKA_USERNAME, kPass: process.env.KAFKA_PASSWORD }
			// const otherScrts = { token: process.env.CONTAINER_API_TOKEN, cldEndpoint: process.env.CLOUD_ENDPOINT }
			// console.log(scrts)
			const externalScrts = { aKey, aSecret, kUid, kPass, cldEndpoint }
			const otherScrts = { token }
			scrts.length = 0; token = ""; aKey = ""; aSecret = ""; cldEndpoint = ""; kUid = ""; kPass = ""

			await starterFunc(externalScrts, otherScrts)
			await shutdown(0, "completed");
		} else {
			console.error("Invalid file execution");
			process.exit(1);
		}
	} catch (err) {
		console.error(err, " < < ");
		await shutdown(1, "startup failure");
	}
})();





