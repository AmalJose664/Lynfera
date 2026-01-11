import AppError from "./AppError.js";
import { HTTP_STATUS_CODE } from "./statusCodes.js";

const buildDispatchUrl = process.env.BUILD_DISPATCH_URL || ""
const buildDispatchEventType = "run-build"
export async function dispatchBuild(deploymentId: string, projectId: string): Promise<void> {
	const result = await fetch(buildDispatchUrl, {
		method: "POST",
		body: JSON.stringify({
			event_type: buildDispatchEventType,
			client_payload: {
				projectId: projectId,
				deploymentId: deploymentId
			}
		}),
		headers: {
			"Accept": "application/vnd.github+json",
			"Content-Type": "application/json",
			Authorization: "Bearer " + process.env.BUILD_DISPATCH_PAT_TOKEN,
		}

	})
	if (!result.ok) {
		const text = await result.text();
		throw new AppError(`Build dispatch failed: ${result.status} ${text}`, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
	}

}