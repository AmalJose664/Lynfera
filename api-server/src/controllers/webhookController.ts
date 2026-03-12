import { ENVS } from "@/config/env.config.js";
import { WEBHOOK_ERRORS } from "@/constants/errors.js";
import { githubAppSlug } from "@/constants/gh.js";
import { IWebhookController } from "@/interfaces/controller/IWebhookController.js";
import { IWebhookService } from "@/interfaces/service/IWebhookService.js";
import { GithubResponseMapper } from "@/mappers/GithubMapper.js";
import AppError, { WebhookError } from "@/utils/AppError.js";

import { STATUS_CODES } from "@/utils/statusCodes.js";
import { Request, Response, NextFunction } from "express";

class WebhookController implements IWebhookController {
	private webhookService: IWebhookService;

	constructor(webhookService: IWebhookService) {
		this.webhookService = webhookService;
	}


	async getGithubConnectionUrl(req: Request, res: Response, next: NextFunction): Promise<void> {

		try {
			const userId = req.user?.id as string
			const installCompleteRedirectPath = req.get("x-redirect-path")
			if (!installCompleteRedirectPath) {
				throw new WebhookError(WEBHOOK_ERRORS.INCOMPLE_DATA, STATUS_CODES.BAD_REQUEST)
			}

			const token = await this.webhookService.webhookHandleNewRequest(userId, installCompleteRedirectPath)
			const installUrl = `https://github.com/apps/${githubAppSlug}/installations/new?state=${token}`;

			res.status(STATUS_CODES.OK).json({ message: "Ok", url: installUrl });
		} catch (error) {
			next(error)
		}
	}

	async githubWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { body } = req
			const eventType = String(req.headers["x-github-event"])
			switch (eventType) {
				case "push":
					// push tasks 
					if (body.created) {
						// new branch/tag
					}

					if (body.deleted) {
						// deleted branch/tag  65145343
					}

					break
				case "installation":
					const action = body.action
					switch (action) {
						case "created":
							await this.webhookService.webhookInstaltnCreateEvent(body.installation.id, body.installation.account)
							break

						case "deleted":
							await this.webhookService.webhookInstaltnDeleteEvent(body.installation.id, body.installation.account)
							break
					}
					break
			}

			console.log(body)
			res.json({ status: 200, message: "success" })


		} catch (error) {
			next(error);
		}
	}




	async githubAppSetup(req: Request, res: Response, next: NextFunction): Promise<void> {

		const installationId = req.query.installation_id
		const body = req.body

		let returnMessage = ""
		let success = true

		try {
			returnMessage = await this.webhookService.githubSecondaryEvents(String(installationId), body.user)
		} catch (error: any) {
			success = false
			returnMessage = error?.message || "Unknown error"
			console.error(error)

			try {
				if (error instanceof WebhookError) {
					await this.webhookService.removeGhbInstallation(String(installationId), body.user, true)
				}
			} catch (e: any) {
				console.error(e)
			}

		}

		const urlFromState = body.redirectPath
		const baseUrl = ENVS.FRONTEND_URL + (urlFromState || "/user/")

		const params = new URLSearchParams({
			tab: "provider",
			success: String(success),
			message: returnMessage
		})

		res.status(success ? STATUS_CODES.OK : STATUS_CODES.BAD_REQUEST).redirect(`${baseUrl}?${params.toString()}`)

	}

	async getUserRepos(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string
			const repos = await this.webhookService.getUserRepos(userId)
			const response = GithubResponseMapper.toGithubRepoResponse(repos)

			res.status(STATUS_CODES.OK).json(response)

		} catch (error) {
			next(error)
		}
	}
	async getUserRepoBranches(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string
			const owner = req.params.owner
			const repo = req.params.repo
			const branches = await this.webhookService.getUserRepoBranches(userId, owner, repo)
			const response = GithubResponseMapper.toGithubRepoBranchResponse(branches)

			res.status(STATUS_CODES.OK).json(response)

		} catch (error) {
			next(error)
		}
	}
	async getUserAccountData(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string
			const account = await this.webhookService.getUserAccountData(userId,)
			const response = GithubResponseMapper.toGithubAccountResponse(account)

			res.status(STATUS_CODES.OK).json(response)

		} catch (error) {
			next(error)
		}
	}

	async removeGithubApp(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string

			const result = await this.webhookService.removeGhbInstallationManual(userId)
			res.status(STATUS_CODES.NO_CONTENT).json({ result })

		} catch (error) {
			next(error)
		}
	}
}

export default WebhookController;
