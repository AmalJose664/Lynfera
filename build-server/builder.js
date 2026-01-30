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

let DEPLOYMENT_ID = process.env.DEPLOYMENT_ID || "---"   // Received from env by apiserver or use backup for local testing
let PROJECT_ID = process.env.PROJECT_ID || "---"   // Received from env by apiserver or use backup for local testing
const brandName = "Lynfera"

let kafkaProducer = null
let API_SERVER_CONTAINER_API_TOKEN = null


let s3Client = null
const BUCKET_NAME = process.env.CLOUD_BUCKET

console.log("Starting file..")
const git = simpleGit();
const limit = pLimit(8);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const deploymentStatus = {
	NOT_STARTED: "NOT_STARTED",
	QUEUED: "QUEUED",
	BUILDING: "BUILDING",
	READY: "READY",
	FAILED: "FAILED",
	CANCELED: "CANCELLED"
}
const logValues = {
	INFO: "INFO",
	SUCCESS: "SUCCESS",
	ERROR: "ERROR",
	DECOR: "DECOR",
	WARN: "WARN"
}

const settings = {
	runnOnlyQueuedDeplymnts: true, // only run if deployment is in queued state
	customBuildPath: !true,
	sendKafkaMessage: true,
	deleteSourcesAfter: !true,
	sendLocalDeploy: !true,       // for sending uploads to non s3
	localDeploy: !true,           // for non s3 uploads
	runCommands: true,            // for testing only 
	cloneRepo: true            // for testing only 
}

console.log(DEPLOYMENT_ID, PROJECT_ID, "<<<<<")

let gitCommitData = process.env.GIT_COMMIT_DATA || "----||-----"

const userSettings = {
	skipInstall: false,
	skipBuild: false,
	maxInstallTries: 3,
	skipDecorLogs: false,
	frameworkSetByUser: null,
	preventAutoPromoteDeployment: false
}

let logsNumber = 0
let logBuffer = [];
let flushTimer = null;
// ----------------------------------------------------FUNCTIONS--------------------------------------------------
const deleteEnvs = () => {

	delete process.env.KAFKA_USERNAME;
	delete process.env.KAFKA_PASSWORD;
	delete process.env.CLOUD_SECRETKEY;
	delete process.env.CLOUD_ACCESSKEY;
	delete process.env.CONTAINER_API_TOKEN;
	delete process.env.CLOUD_ENDPOINT;
	delete process.env.CLOUD_BUCKET;

}

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

const repeat = (s, n) => Array.from({ length: n }).fill(s).join(" ")
const line = (n) => "\x1b[38;5;14m" + (Array.from({ length: n }).fill("──").join("")) + "\x1b[0m"
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

async function cloneGitRepoAndValidate(taskDir, runDir, projectData) {

	if (settings.cloneRepo) {
		await git.clone(projectData.repoURL, taskDir, [
			'--filter=blob:none',
			'--branch', projectData.branch,
			'--single-branch'
		], (data) => {
			console.log("done cloning = >", data)
		})
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

async function getGitCommitData(taskDir) {
	const repoGit = simpleGit(taskDir);
	const logss = await repoGit.log({})
	return logss.all[0].hash + "||" + logss.all[0].message
}

async function fetchProjectData(deploymentId = "") {
	const API_ENDPOINT = process.env.API_ENDPOINT
	const baseUrl = `${API_ENDPOINT}/api/internal`

	try {
		const deploymentResponse = await axios.get(`${baseUrl}/deployments/${deploymentId}`, {
			timeout: 24000,
			headers: {
				Authorization: `Bearer ${API_SERVER_CONTAINER_API_TOKEN}`
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
				Authorization: `Bearer ${API_SERVER_CONTAINER_API_TOKEN}`
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
	} catch (error) {
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

async function validatePackageJsonAndGetFramework(dir, rootDir) {
	const packageJsonPath = path.join(dir, "package.json")
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
	const suspiciousCommands = [
		'curl', 'wget', 'Invoke-WebRequest', 'certutil',
		'rm -rf', 'rmdir', 'del ', 'format ', 'mkfs', 'chmod', "node", 'chown',
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
		for (const command of suspiciousCommands) {
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
const EXCLUDE_PATTERNS = [
	'node_modules',
	'.git',
	".next/cache",
	'.env',
	'.env.local',
	'.env.*.local',
	'coverage',
	".turbo",
	'.cache',
	'.vscode',
	'.idea',
	'*.log',
	'.DS_Store',
	'Thumbs.db'
];
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB per file
const MAX_TOTAL_SIZE = 280 * 1024 * 1024; // 280MB total
const WARN_MAX_TOTAL_SIZE = 80 * 1024 * 1024; // give warning on this limit
const MAX_NO_OF_FILES = 1000
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
	async function processDirectory(currentDir, relativePath = "") {
		const entries = await readdir(currentDir, { withFileTypes: true })
		for (const entry of entries) {
			const fullPath = path.join(currentDir, entry.name)
			const relPath = path.join(relativePath, entry.name)

			if (shouldExcludeDir(entry.name, relPath)) {
				console.log("Skipping ----------- ", relPath)
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

// --------------------------------------------------------MAIN_TASK--------------------------------------------------

let projectData = null
let projectUser = ""

async function init() {

	if (settings.sendKafkaMessage) {
		await kafkaProducer.connect();
	};

	["\x1b[38;5;153m\x1b[3;2m" + repeat("-", 60) + "\x1b[38;5;153m\x1b[3;2m BEGIN " + "\x1b[38;5;153m\x1b[3;2m" + repeat("-", 150) + "\x1b[0m", repeat(" ", 100)].map((v) => publishLogs({
		DEPLOYMENT_ID, PROJECT_ID,
		level: logValues.DECOR,
		message: v, stream: "system"
	}))
	publishLogs({
		DEPLOYMENT_ID, PROJECT_ID,
		level: logValues.INFO,
		message: "Starting deployment..", stream: "system"
	})
	const timerStart = performance.now();
	await publishUpdates({
		DEPLOYMENT_ID, PROJECT_ID,
		type: "START",
		commit_hash: gitCommitData,
		status: deploymentStatus.BUILDING
	});

	try {
		//logs
		console.log("Executing script.js");

		console.log("Fetching project data");
		const taskDir = path.join(__dirname, "./output/");            // UPDATE THIS ON DEPLOYMENT !!!!!!!!!!!!!!!!!

		["Directory set to " + taskDir, "Fetching project data "].map((v) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.INFO,
			message: `${v}`, stream: "system"
		}));

		//-----------------------------------------CLONING_FETCHING-----------------------------------------------------------------------------------------------------


		const [project, deploymentData] = await fetchProjectData(DEPLOYMENT_ID);
		projectData = project;
		projectUser = project.user;
		DEPLOYMENT_ID = deploymentData._id;
		PROJECT_ID = projectData._id;

		const installCommand = "install";
		const buildCommand = projectData.buildCommand || "build";


		const runDirDisplay = path.join(taskDir, projectData.rootDir); // to display in logs
		const cleanedPaths = validateDirectories(taskDir, projectData.rootDir, projectData.outputDirectory || "dist");
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
		// console.log({ finalEnvsBuild, finalEnvsInstall })


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
			installDuration = ((installEndTimer - installTimer) / 1000).toFixed(2)
			console.log('Dependencies installed successfully in ', installDuration, " seconds");

			publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.DECOR,
				message: repeat(" ", 25), stream: "system"
			});

			[
				"\x1b[38;5;123m Install Success\x1b[0m",
				`Dependencies installed successfully  in ${installDuration} seconds`
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

		await publishUpdates({
			DEPLOYMENT_ID, PROJECT_ID,
			type: "END",
			status: deploymentStatus.READY,
			user: projectData.user,
			techStack: userSettings.frameworkSetByUser || framweworkIdentified.framework,
			install_ms: Number(installDuration),
			build_ms: Number((buildEndTimer - buildTimer).toFixed(2)),
			upload_ms: Number((uploadEndTimer - uploadTimer).toFixed(2)),
			duration_ms: Number(durationMs.toFixed(2)),
			commit_hash: gitCommitData,
			complete_at: new Date().toISOString(),
			file_structure: { files: fileStructure, totalSize }
		})

		console.log("Time taken ", durationMs.toFixed(2), "logs number ", logsNumber)
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
			await publishUpdates({
				DEPLOYMENT_ID, PROJECT_ID,
				type: "ERROR",
				status: deploymentStatus.FAILED,
				user: projectUser || "",
				error_message: "Internal server error",
				complete_at: new Date().toISOString(),
			})
		}
		console.log("Some error happened")
		console.log("Exiting in 5 seconds")
	} finally {
		await sendLogsAsBatch();
		await kafkaProducer.disconnect();
		await new Promise((res) => setTimeout(res, 5000));
	}
}


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

function readStdin() {
	const input = readFileSync(0, 'utf8');
	process.stdin.destroy()
	return input
}

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





