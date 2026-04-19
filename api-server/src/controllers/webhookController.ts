import { ENVS } from "@/config/env.config.js";
import { WEBHOOK_ERRORS } from "@/constants/errors.js";
import { githubAppSlug } from "@/constants/gh.js";
import { GithubCommitType } from "@/constants/types/github.js";
import { IWebhookController } from "@/interfaces/controller/IWebhookController.js";
import { IGithubService } from "@/interfaces/service/IGithubService.js";
import { IWebhookService } from "@/interfaces/service/IWebhookService.js";
import { GithubResponseMapper } from "@/mappers/GithubMapper.js";
import AppError, { WebhookError } from "@/utils/AppError.js";

import { STATUS_CODES } from "@/utils/statusCodes.js";
import { Request, Response, NextFunction } from "express";

class WebhookController implements IWebhookController {
	private webhookService: IWebhookService;
	private githubService: IGithubService;

	constructor(webhookService: IWebhookService, githubService: IGithubService) {
		this.webhookService = webhookService;
		this.githubService = githubService;
	}

	async getGithubConnectionUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const installCompleteRedirectPath = req.get("x-redirect-path");
			if (!installCompleteRedirectPath) {
				throw new WebhookError(WEBHOOK_ERRORS.INCOMPLE_DATA, STATUS_CODES.BAD_REQUEST);
			}

			const token = await this.webhookService.webhookHandleNewRequest(userId, installCompleteRedirectPath);
			const installUrl = `https://github.com/apps/${githubAppSlug}/installations/new?state=${token}`;

			res.status(STATUS_CODES.OK).json({ message: "Ok", url: installUrl });
		} catch (error) {
			next(error);
		}
	}

	async githubWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			let deployResult = { status: "", reason: "" };
			const { body } = req;
			const eventType = String(req.headers["x-github-event"]);
			switch (eventType) {
				case "push": {
					const repository = body.repository;
					const sender = body.sender;
					const installationId = body.installation.id;
					const ref = body.ref;
					const allChanges: string[] = [];
					const headCommit = body.head_commit;
					let deployRequired = false;
					for (const commit of body.commits as GithubCommitType[]) {
						if (allChanges.length > 100) {
							deployRequired = true;
							break;
						}
						allChanges.push(...commit.added, ...commit.removed, ...commit.modified);
					}
					const meta = { sender, installationId, ref, allChanges, headCommit, deployRequired };

					deployResult = await this.webhookService.webhookCodePushEvent(repository, meta);
					console.log({ deployResult });
					break;
				}

				case "installation": {
					const action = body.action;
					switch (action) {
						case "created":
							await this.webhookService.webhookInstaltnCreateEvent(body.installation.id, body.installation.account, body.repositories);
							break;

						case "deleted":
							await this.webhookService.webhookInstaltnDeleteEvent(body.installation.id, body.installation.account, body.repositories);
							break;
					}
					break;
				}

				case "check_run": {
					const checkRunAction = body.action;
					switch (checkRunAction) {
						case "rerequested": {
							const repository = body.repository;
							const sender = body.sender;
							const installationId = body.installation.id;

							const headCommitId = body.check_run.head_sha;
							const meta = { sender, installationId, headCommitId };

							deployResult = await this.webhookService.webhookCheckRunReRequestEvent(repository, meta);
							console.log({ deployResult });
							break;
						}
					}
					break;
				}

				case "installation_repositories": {
					const repoActions = body.action;
					switch (repoActions) {
						case "added":
							await this.webhookService.webhookRepositoryAddRemove(body.repositories_added, body.repositories_removed);
							break;
						case "removed":
							await this.webhookService.webhookRepositoryAddRemove(body.repositories_added, body.repositories_removed);
							break;
					}
				}
				default: {
					console.log("Github webhook req: ", body.action, body.repository.id, eventType);
				}
			}

			// console.log("\n---------------------\n", JSON.stringify(body, null, 2), "\n---------------------\n",
			// 	req.headers, "\n---------------------\n")

			res.json({ status: 200, message: "success", deployResult });
		} catch (error) {
			next(error);
		}
	}

	async githubAppSetup(req: Request, res: Response, next: NextFunction): Promise<void> {
		const installationId = req.query.installation_id;
		const body = req.body;

		let returnMessage = "";
		let success = true;

		try {
			returnMessage = await this.webhookService.githubSecondaryEvents(String(installationId), body.user);
		} catch (error: any) {
			success = false;
			returnMessage = error?.message || "Unknown error";
			console.error(error);

			try {
				if (error instanceof WebhookError) {
					await this.webhookService.removeGhbInstallation(String(installationId), body.user, true);
				}
			} catch (e: any) {
				console.error(e);
			}
		}

		const urlFromState = body.redirectPath;
		const baseUrl = ENVS.FRONTEND_URL + (urlFromState || "/user/");

		const params = new URLSearchParams({
			tab: "provider",
			success: String(success),
			message: returnMessage,
		});

		res.status(success ? STATUS_CODES.OK : STATUS_CODES.BAD_REQUEST).redirect(`${baseUrl}?${params.toString()}`);
	}

	async getUserRepos(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const repos = await this.githubService.getUserRepos(userId);
			const response = GithubResponseMapper.toGithubReposResponse(repos);

			res.status(STATUS_CODES.OK).json(response);
		} catch (error) {
			next(error);
		}
	}
	async getUserRepo(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const owner = req.params.owner;
			const repo = req.params.repo;
			const repoResult = await this.githubService.getUserRepo(userId, owner, repo);
			const response = GithubResponseMapper.toGithubRepoResponse(repoResult);
			res.status(STATUS_CODES.OK).json(response);
		} catch (error) {
			next(error);
		}
	}
	async getUserRepoBranches(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const owner = req.params.owner;
			const repo = req.params.repo;
			const branches = await this.githubService.getUserRepoBranches(userId, owner, repo);
			const response = GithubResponseMapper.toGithubRepoBranchResponse(branches);

			res.status(STATUS_CODES.OK).json(response);
		} catch (error) {
			next(error);
		}
	}
	async getUserAccountData(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const account = await this.githubService.getUserAccountData(userId);
			const response = GithubResponseMapper.toGithubAccountResponse(account);

			res.status(STATUS_CODES.OK).json(response);
		} catch (error) {
			next(error);
		}
	}

	async removeGithubApp(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;

			const result = await this.webhookService.removeGhbInstallationManual(userId);
			res.status(STATUS_CODES.NO_CONTENT).json({ result });
		} catch (error) {
			next(error);
		}
	}
}

export default WebhookController;
