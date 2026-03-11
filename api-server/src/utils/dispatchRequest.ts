import { ENVS } from "@/config/env.config.js";
import AppError, { WebhookError } from "./AppError.js";
import { STATUS_CODES } from "./statusCodes.js";
import { generateTokenContainerAccessToken } from "./generateToken.js";
import { GITHUB_ACCEPT_HEADER, installationIdVerifyUrl as installationIdVerifyUrl, newAccessTokensUrl, reposUrl } from "@/constants/gh.js";
import { WEBHOOK_ERRORS } from "@/constants/errors.js";
import { GithubRepoResponse } from "@/constants/types/github.js";


class DispatchRequests {
	async dispatchBuild(deploymentId: string, projectId: string): Promise<void> {

		const buildDispatchUrl = ENVS.BUILD_DISPATCH_URL || "";
		const buildDispatchEventType = "run-build";

		const token = generateTokenContainerAccessToken(projectId, deploymentId);
		const payload = {
			event_type: buildDispatchEventType,
			client_payload: {
				projectId: projectId,
				deploymentId: deploymentId,
				serviceToken: token,
			},
		};
		const result = await fetch(buildDispatchUrl, {
			method: "POST",
			body: JSON.stringify(payload),
			headers: {
				Accept: GITHUB_ACCEPT_HEADER,
				"Content-Type": "application/json",
				Authorization: "Bearer " + ENVS.BUILD_DISPATCH_PAT_TOKEN,
			},
		});
		if (!result.ok) {
			const text = await result.text();
			throw new AppError(`Build dispatch failed: ${result.status} ${text}`, STATUS_CODES.INTERNAL_SERVER_ERROR);
		}
	}


	async githubInsatallationVerify(installationId: number, token: string): Promise<Record<string, any>> {

		const url = installationIdVerifyUrl + installationId
		const data = await fetch(url, {
			method: "GET",
			headers: {
				"Accept": GITHUB_ACCEPT_HEADER,
				"Authorization": `Bearer ${token}`
			}
		})

		if (!data.ok) {
			const result = await data.json() as unknown as {
				message: string
				status: number
			}
			const message = result.message
			console.log(message)
			throw new WebhookError(message, STATUS_CODES.INTERNAL_SERVER_ERROR);
		}
		return await data.json()
	}


	async githubInstallationDelete(installationId: number, token: string): Promise<boolean> {

		const url = installationIdVerifyUrl + installationId
		const data = await fetch(url, {
			method: "DELETE",
			headers: {
				"Accept": GITHUB_ACCEPT_HEADER,
				"Authorization": `Bearer ${token}`
			}
		})
		if (!data.ok) {
			const result = await data.json() as unknown as {
				message: string
				status: number
			}
			const message = result.message
			console.log(message)
			throw new WebhookError(message, STATUS_CODES.INTERNAL_SERVER_ERROR);
		}
		return true
	}

	async getInstallationAccessToken(installationId: number, token: string): Promise<string> {
		const requestUrl = newAccessTokensUrl(installationId)

		const data = await fetch(requestUrl, {
			method: "POST",
			headers: {
				"Accept": GITHUB_ACCEPT_HEADER,
				"Authorization": `Bearer ${token}`
			}
		})
		const result = await data.json() as unknown as {
			token: string,
			expires_at: string,
			permissions: {
				contents: string,
				metadata: string
			},
			repository_selection: string
		}
		if (!data.ok) {

			throw new WebhookError(WEBHOOK_ERRORS.ACCESS_TOKEN_CREATE_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
		}
		const accessToken = result.token
		return accessToken
	}



	async getUserRepos(token: string): Promise<GithubRepoResponse[]> {
		const requestUrl = reposUrl

		const data = await fetch(requestUrl, {
			method: "GET",
			headers: {
				"Accept": GITHUB_ACCEPT_HEADER,
				"Authorization": `Bearer ${token}`
			}
		})
		const result = await data.json() as unknown as {
			total_count: number;
			repositories: GithubRepoResponse[];
		}

		if (!data.ok) {
			throw new WebhookError(WEBHOOK_ERRORS.REPO_FETCH, STATUS_CODES.INTERNAL_SERVER_ERROR);
		}
		return result.repositories

	}
}
const dispatchRequestService = new DispatchRequests()
export default dispatchRequestService

