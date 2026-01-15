import { ENVS } from "@/config/env.config.js";
import AppError from "./AppError.js";
import { STATUS_CODES } from "./statusCodes.js";

const buildDispatchUrl = ENVS.BUILD_DISPATCH_URL || "";
const buildDispatchEventType = "run-build";
export async function dispatchBuild(deploymentId: string, projectId: string): Promise<void> {
	const result = await fetch(buildDispatchUrl, {
		method: "POST",
		body: JSON.stringify({
			event_type: buildDispatchEventType,
			client_payload: {
				projectId: projectId,
				deploymentId: deploymentId,
			},
		}),
		headers: {
			Accept: "application/vnd.github+json",
			"Content-Type": "application/json",
			Authorization: "Bearer " + ENVS.BUILD_DISPATCH_PAT_TOKEN,
		},
	});
	if (!result.ok) {
		const text = await result.text();
		throw new AppError(`Build dispatch failed: ${result.status} ${text}`, STATUS_CODES.INTERNAL_SERVER_ERROR);
	}
}
