import { execa } from 'execa';
import { existsSync, } from "fs"
import { readdir, stat, rename, mkdir, rm, readFile } from 'fs/promises';
import { createWriteStream, createReadStream } from "fs"
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

let DEPLOYMENT_ID = process.env.DEPLOYMENT_ID || "696fb444114a4d87e4ddf8e7"   // Received from env by apiserver or use backup for local testing
let PROJECT_ID = process.env.PROJECT_ID || "69246647869c614a349015fc"   // Received from env by apiserver or use backup for local testing
const brandName = "Lynfera"
const kafka = new Kafka({
	clientId: `docker-build-server-${PROJECT_ID}-${DEPLOYMENT_ID}`,
	brokers: ["pkc-l7pr2.ap-south-1.aws.confluent.cloud:9092"],
	ssl: true, // or key
	sasl: {
		username: process.env.KAFKA_USERNAME,
		password: process.env.KAFKA_PASSWORD,
		mechanism: "plain"
	},
})

const API_SERVER_CONTAINER_API_TOKEN = process.env.CONTAINER_API_TOKEN
const producer = kafka.producer()


const s3Client = new S3Client({
	region: "auto",
	credentials: {
		accessKeyId: process.env.CLOUD_ACCESSKEY,
		secretAccessKey: process.env.CLOUD_SECRETKEY,
	},
	endpoint: process.env.CLOUD_ENDPOINT,
	forcePathStyle: true
})
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
	DECOR: "DECOR"
}

const settings = {
	customBuildPath: !true,
	sendKafkaMessage: true,
	deleteSourcesAfter: !true,
	sendLocalDeploy: !true,       // for sending uploads to non s3
	localDeploy: !true,           // for non s3 uploads
	runCommands: !true,            // for testing only 
	cloneRepo: !true            // for testing only 
}

console.log(DEPLOYMENT_ID, PROJECT_ID, "<<<<<")

let gitCommitData = process.env.GIT_COMMIT_DATA || "----||-----"



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
		await producer.send({
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
const publishLogs = async (logData = {}) => {
	logsNumber++
	if (!settings.sendKafkaMessage) return
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
		flushTimer = setTimeout(sendLogsAsBatch, 300);
	}
}

const repeat = (s, n) => Array.from({ length: n }).fill(s).join(" ")
const line = (n) => Array.from({ length: n }).fill("\x1b[38;5;14m──\x1b[0m").join("")
const printInfoLogs = () => {
	const symbols = ["✮", "❁", "✧", "❃", "✾", "✣", "─", "❆", "❀", "✴"]
	const deco = `\x1b[96m${symbols[3]}\x1b[0m`
	const side = "\x1b[38;5;27m ➤  \x1b[0m "

	const spaceValue = 3
	const decorationsArray = [];
	decorationsArray.push(repeat(" ", 25))

	decorationsArray.push(repeat(deco, 120))
	decorationsArray.push(" " + repeat(deco, 20) + `   \x1b[\x1b[1m\x1b[38;2;39;199;255m ${brandName.toUpperCase()} BUILD SERVER\x1b[0m   ` + repeat(deco, 20))
	decorationsArray.push(repeat(deco, 120))
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
	decorationsArray.push(repeat(deco, 4) + "  \x1b[96m ➤  BUILD PROCESS INITIALIZED\x1b[0m   " + repeat(deco, 4))
	decorationsArray.push(repeat(deco, 25))

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
				}
			}
		})
		await producer.send({
			topic: "deployment.updates", messages: [
				{ key: "log", value: value }
			]
		})
		console.log("Sendted", updateData.type)
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

		if (!projectData.project.installCommand) {
			publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: "WARN",
				message: "install command not found; running with default command", stream: "data error"
			})
			//logs

		}
		if (!projectData.project.buildCommand) {
			publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: "WARN",
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
			throw new ContainerError("Api server not reachable " + error.message, "data fetching", "Api server not reachable")
		}
		throw error
	}
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
async function runCommand(command, args, cwd, env = []) {
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
			timeout: 15 * 60 * 1000,
			all: false,
		});
		currentProcess = subprocess;
		subprocess.stdout?.on("data", (data) => {
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
				message: `${command} exited with code ${code}`, stream: "stderr"
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
async function validateAnduploadFiles(sourceDir) {

	const zipFileName = "output__" + Math.random().toString(36).slice(2, 12).replaceAll(".", "") + ".zip"

	const output = createWriteStream(path.join(sourceDir, zipFileName));
	const archive = archiver('zip', {
		zlib: { level: 9 }
	});

	archive.pipe(output);
	const uploadsArray = []
	const fileStructure = []
	let totalSize = 0;
	async function processDirectory(currentDir, relativePath = "") {
		const entries = await readdir(currentDir, { withFileTypes: true })
		for (const entry of entries) {
			const fullPath = path.join(currentDir, entry.name)
			const relPath = path.join(relativePath, entry.name)

			if (entry.isDirectory()) {
				await processDirectory(fullPath, relPath);

			} else if (entry.isFile()) {
				const fileStat = await stat(fullPath);
				const normalizedPath = path.normalize(fullPath);
				if (!normalizedPath.startsWith(sourceDir)) {
					console.warn(`Skipping suspicious file path: ${relPath}`);
					publishLogs({
						DEPLOYMENT_ID, PROJECT_ID,
						level: "WARN",
						message: `\x1b[38;5;9m Suspicious file path detected ${relPath} \x1b[0m`,
						stream: "system"
					});
					publishLogs({
						DEPLOYMENT_ID, PROJECT_ID,
						level: "WARN",
						message: `\x1b[38;5;9m Skipping suspicious file path: ${relPath} \x1b[0m`,
						stream: "system"
					});
					continue;
				}
				fileStructure.push({ name: relPath, size: fileStat.size });
				totalSize += fileStat.size;

				if (settings.localDeploy) {
					publishLogs({
						DEPLOYMENT_ID, PROJECT_ID,
						level: logValues.INFO,
						message: "\x1b[38;5;48m uploading " + relPath + "\x1b[0m",
						stream: "system"
					});
					archive.file(fullPath, { name: relPath });
					// await rename(fullPath, targetPath);

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
	await Promise.all(uploadsArray);
	await archive.finalize();
	return new Promise((resolve, reject) => {
		output.on("finish", async () => {
			try {
				await uploadNonAws(sourceDir, zipFileName)
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
		await producer.connect();
	};

	[repeat("\x1b[38;5;153m\x1b[3;2m-", 60) + "\x1b[38;5;153m\x1b[3;2m BEGIN " + repeat("\x1b[38;5;153m\x1b[3;2m-\x1b[0m", 150), repeat(" ", 100)].map((v) => publishLogs({
		DEPLOYMENT_ID, PROJECT_ID,
		level: logValues.DECOR,
		message: v, stream: "system"
	}))
	publishLogs({
		DEPLOYMENT_ID, PROJECT_ID,
		level: logValues.INFO,
		message: "Starting deployment..", stream: "system"
	})
	const timerStart = performance.now()
	await publishUpdates({
		DEPLOYMENT_ID, PROJECT_ID,
		type: "START",
		commit_hash: gitCommitData,
		status: deploymentStatus.BUILDING
	})
	try {
		//logs
		console.log("Executing script.js")

		console.log("Fetching project data")
		const taskDir = path.join(__dirname, "../test-grounds/");             // UPDATE THIS ON DEPLOYMENT !!!!!!!!!!!!!!!!!

		["Directory set to " + taskDir, "Fetching project data "].map((v) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.INFO,
			message: `${v}`, stream: "system"
		}))

		//-----------------------------------------CLONING_FETCHING-----------------------------------------------------------------------------------------------------


		const [project, deploymentData] = await fetchProjectData(DEPLOYMENT_ID)
		projectData = project
		projectUser = project.user
		DEPLOYMENT_ID = deploymentData._id
		PROJECT_ID = projectData._id

		const installCommand = projectData.installCommand || "install"
		const buildCommand = projectData.buildCommand || "build"
		const outputFilesDir = projectData.outputDirectory || "dist"



		const runDir = path.join(taskDir, projectData.rootDir)

		publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.INFO,
			message: `cloning repo..`, stream: "system"
		})


		await cloneGitRepoAndValidate(taskDir, runDir, projectData)
		gitCommitData = await getGitCommitData(taskDir).catch((e) => console.log("Error getting commit", e)) || gitCommitData

		publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.INFO,
			message: `git repo cloned...`, stream: "system"
		})

		const framweworkIdentified = await validatePackageJsonAndGetFramework(runDir, projectData.rootDir)
		const buildOptions = getDynamicBuildRoot(framweworkIdentified.tool);

		["Detected 1 framework", "Framework " + framweworkIdentified.framework + " identified",
			repeat(" ", 10), repeat("\x1b[38;5;153m\x1b[3;2m-", 60) + "\x1b[38;5;153m\x1b[3;2m INSTALL " + repeat("\x1b[38;5;153m\x1b[3;2m-\x1b[0m", 150), repeat(" ", 10)].map((v) => publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.DECOR,
				message: v, stream: "system"
			}))
		printInfoLogs();


		//-----------------------------------------------------------INSTALL-------------------------------------------------------------------------------------------


		["\x1b[\x1b[1m\x1b[38;2;39;199;255m Installing packages...\x1b[0m", line(36)
		].map((v) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.DECOR,
			message: v, stream: "system"
		}))
		const installTimer = performance.now()
		let installTries = 0
		while (installTries < 3) {
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
				await runCommand("npm", [...installCommand.split(" "), ...extraFlags], runDir, projectData.env ?? [])
				break
			} catch (error) {
				installTries++;
				[`\x1b[38;5;220m Failed to install with command npm ${installCommand} \x1b[0m`, //\x1b[3m
				`---------------Retrying install${installTries}-------------`,
				`---------------Try No. ${installTries}-------------`
				].map((v) => publishLogs({
					DEPLOYMENT_ID, PROJECT_ID,
					level: "WARN",
					message: v, stream: "system"
				}))
				if (installTries >= 3) throw error;
				await new Promise(r => setTimeout(r, 2000));
			}
		}

		const installEndTimer = performance.now()

		console.log('Dependencies installed successfully in ', (installEndTimer - installTimer).toFixed(2), " ms");

		publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.DECOR,
			message: repeat(" ", 25), stream: "system"
		});

		[
			"\x1b[38;5;123m Install Success\x1b[0m",
			`Dependencies installed successfully  in ${(installEndTimer - installTimer).toFixed(2)} ms`
		].map((v) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.SUCCESS,
			message: v, stream: "system"
		}))



		//-----------------------------------------BUILD---------------------------------------------------------------------------------------------------------




		const buildTimer = performance.now();

		[
			{ msg: repeat(" ", 10), state: logValues.DECOR },
			{ msg: repeat("\x1b[38;5;153m\x1b[3;2m-", 60) + "\x1b[38;5;153m\x1b[3;2m BUILD " + repeat("\x1b[38;5;153m\x1b[3;2m-\x1b[0m", 150), state: logValues.DECOR },
			{ msg: repeat(" ", 10), state: logValues.DECOR },
			{ msg: "Starting build", state: logValues.INFO },
			{ msg: `\x1b[1m\x1b[38;2;39;199;255m ${brandName} Build...\x1b[0m`, state: logValues.DECOR },
			{ msg: line(36), state: logValues.DECOR },
			{ msg: "\x1b[38;5;123m Building with command $ npm run \x1b[38;5;220m" + buildCommand + "\x1b[0m", state: logValues.INFO },
		].map(({ msg, state }) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: state,
			message: msg, stream: "system"
		}));
		await runCommand(
			"npm",
			["run", ...buildCommand.split(" "), ...((settings.customBuildPath && framweworkIdentified.tool.toLowerCase() !== "cra") ? ["--", buildOptions] : [])],
			runDir,
			(framweworkIdentified.tool.toLowerCase() === "cra" && settings.customBuildPath)
				? [...(projectData.env || []), { name: "PUBLIC_URL", value: "." }]
				: [...projectData.env]
		)

		const buildEndTimer = performance.now();
		console.log("Build complete ", (buildEndTimer - buildTimer).toFixed(2), " ms");
		[
			{ msg: repeat(" ", 25), state: logValues.INFO },
			{ msg: "\x1b[38;5;123m Build Success\x1b[0m", state: logValues.SUCCESS },
			{ msg: `Build complete in ${(buildEndTimer - buildTimer).toFixed(2)} ms`, state: logValues.SUCCESS },
			{ msg: repeat(" ", 25), state: logValues.INFO },
			{ msg: "Validating build files", state: logValues.INFO }
		].map(({ msg, state }) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: state,
			message: msg, stream: "system"
		}))

		const distFolderPath = path.join(runDir, outputFilesDir);
		if (!existsSync(distFolderPath)) {
			throw new ContainerError(outputFilesDir + ' folder not found after build', "system");
		}
		console.log("done.....");
		console.log("Post build configurations running....");

		[
			{ msg: "File validation done ", state: logValues.SUCCESS },
			{ msg: "Post build configurations running....", state: logValues.INFO },
			{ msg: repeat(" ", 10), state: logValues.DECOR },
			{ msg: repeat("\x1b[38;5;153m\x1b[3;2m-", 60) + "\x1b[38;5;153m\x1b[3;2m UPLOAD " + repeat("\x1b[38;5;153m\x1b[3;2m-\x1b[0m", 150), state: logValues.DECOR },
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
		const { fileStructure, totalSize } = await validateAnduploadFiles(distFolderPath)

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

		[repeat(" ", 10), repeat("\x1b[38;5;153m\x1b[3;2m-", 60) + "\x1b[38;5;153m\x1b[3;2m END " + repeat("\x1b[38;5;153m\x1b[3;2m-\x1b[0m", 150),
		repeat(" ", 10),
		].map((v) => publishLogs({
			DEPLOYMENT_ID, PROJECT_ID,
			level: logValues.DECOR,
			message: v, stream: "system"
		}));



		["Deployment Done ...🎉", "Task done in " + durationMs.toFixed(2) + " ms🎉",
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
			techStack: framweworkIdentified.framework,
			install_ms: Number((installEndTimer - installTimer).toFixed(2)),
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
			publishLogs({
				DEPLOYMENT_ID, PROJECT_ID,
				level: logValues.ERROR,
				message: `${err.message} || ${err.cause}`, stream: err.stream
			});

			[repeat(" ", 10), repeat("\x1b[38;5;197m-", 60) + "\x1b[38;5;197m END " + repeat("\x1b[38;5;197m-\x1b[0m", 150),
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
				error_message: err.message + " || " + err.cause
			})
		}
		else {
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
				error_message: "Internal server error"
			})
		}

	} finally {
		await sendLogsAsBatch()
		await producer.disconnect()
		await new Promise((res) => setTimeout(res, 5000))
		process.exit(0)

	}
}

process.on('SIGTERM', async () => {
	console.log('Terminate signal, cleaning up...');
	if (currentProcess) killProcess(currentProcess);
	await producer.disconnect();
	process.exit(0);
});

process.on('SIGINT', async () => {
	console.log('Kill signal  cleaning up...');
	if (currentProcess) killProcess(currentProcess);
	await producer.disconnect();
	process.exit(0);
});

process.on('uncaughtException', async (err) => {
	console.error('Error:', err);
	if (currentProcess) killProcess(currentProcess);
	await publishUpdates({
		DEPLOYMENT_ID, PROJECT_ID,
		type: logValues.ERROR,
		status: deploymentStatus.FAILED,
		error_message: "Internal server error"
	});
	await producer.disconnect();
	process.exit(1);
});
deleteEnvs()
init()
