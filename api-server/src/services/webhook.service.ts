import { PROJECT_ERRORS, USER_ERRORS, WEBHOOK_ERRORS } from "@/constants/errors.js";
import { GithubCommitType, GithubRepoResponse, GithubRepositoryBranch, GithubRepositoryOwner } from "@/constants/types/github.js";
import { IRedisCache } from "@/interfaces/cache/IRedisCache.js";
import { IDeploymentService } from "@/interfaces/service/IDeploymentService.js";
import { IGithubService } from "@/interfaces/service/IGithubService.js";
import { IProjectService } from "@/interfaces/service/IProjectService.js";
import { IUserSerivce } from "@/interfaces/service/IUserService.js";
import { IWebhookService } from "@/interfaces/service/IWebhookService.js";
import { IDeployment } from "@/models/Deployment.js";
import AppError, { WebhookError } from "@/utils/AppError.js";
import dispatchRequestService from "@/utils/dispatchRequest.js";
import { generateTokenForGithubAppInstallation } from "@/utils/generateToken.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";

class WebhookService implements IWebhookService {
	private userService: IUserSerivce;
	private deploySvs: IDeploymentService;
	private projectSvcs: IProjectService;
	private githubSvcs: IGithubService;
	constructor(userSrvice: IUserSerivce, projectSvc: IProjectService, deploymentService: IDeploymentService, githubService: IGithubService) {
		this.userService = userSrvice;
		this.githubSvcs = githubService;
		this.deploySvs = deploymentService;
		this.projectSvcs = projectSvc;
	}

	async webhookHandleNewRequest(userId: string, redirectPath: string): Promise<string> {
		const user = await this.githubSvcs.getUserInfo(userId);
		const token = generateTokenForGithubAppInstallation(user._id.toString(), redirectPath);
		return token;
	}

	async webhookInstaltnCreateEvent(installationId: number, account: GithubRepositoryOwner, repos: GithubRepoResponse[]): Promise<void> {
		// console.log({ installationId, account })
		const allReposToChange = repos.map((r) => r.id);
		await this.projectSvcs.__linkGhProjectsBack(allReposToChange);
	}

	async webhookInstaltnDeleteEvent(installationId: number, account: GithubRepositoryOwner, repos: GithubRepoResponse[]): Promise<void> {
		// await this.userService.removeGithubInstallationInfo(installationId)
		console.log(installationId, repos);
		const allReposToChange = repos.map((r) => r.id);
		await this.projectSvcs.__unLinkGhProjects(allReposToChange);
	}

	async webhookRepositoryAddRemove(added: GithubRepoResponse[], removed: GithubRepoResponse[]): Promise<void> {
		const allReposAdd = added.map((r) => r.id);
		const allReposRemove = removed.map((r) => r.id);
		console.log("Remvoing ", allReposRemove);
		console.log("Adding ", allReposAdd);
		await Promise.all([
			allReposAdd.length ? this.projectSvcs.__linkGhProjectsBack(allReposAdd) : Promise.resolve(),
			allReposRemove.length ? this.projectSvcs.__unLinkGhProjects(allReposRemove) : Promise.resolve(),
		]);
	}

	async webhookCodePushEvent(
		repo: GithubRepoResponse,
		meta: {
			sender: GithubRepositoryOwner;
			installationId: number;
			ref: string;
			headCommit: GithubCommitType;
			allChanges: string[];
			deployRequired: boolean;
		},
	): Promise<{ status: string; reason: string }> {
		const { ref, installationId, sender, allChanges, deployRequired, headCommit } = meta;
		if (headCommit.message.includes("[skip-ci]")) {
			console.log("Found skip command");
			return { status: "ignored", reason: "Manual override" };
		}
		const project = await this.projectSvcs.__getProjectByRepository(repo.id);

		console.log({ allChanges });

		if (!project) {
			console.log("No Project found");
			return { status: "ignored", reason: PROJECT_ERRORS.NOT_FOUND };
		}
		if (project.isDisabled || project.isDeleted) {
			return { status: "ignored", reason: "project inactive" };
		}
		if (!project.autoDeployEnabled) {
			console.log("Project webhook disabled");
			return { status: "ignored", reason: "Project auto deploy disabled" };
		}
		const branch = ref.replace("refs/heads/", "");
		if (project.branch !== branch) {
			console.log("Unrealated branch");
			return { status: "ignored", reason: "branch mismatch" };
		}

		let shouldDeploy = false;
		let hasChanges = false;
		if (deployRequired) {
			shouldDeploy = true;
		} else {
			const pathFound = project.rootDir.startsWith("/") ? project.rootDir.replace(/^\//, "") : project.rootDir;
			hasChanges = !pathFound ? true : allChanges.some((c) => c.startsWith(pathFound));
		}
		if (headCommit.message.includes("[force-deploy]")) {
			shouldDeploy = true;
		}

		if (!shouldDeploy && !hasChanges) {
			return { status: "ignored", reason: "No changes" };
		}

		const deployData: Partial<IDeployment> = {
			triggeredBy: `${sender.id}||${sender.login}`,
			commit_hash: `${headCommit.id}||${headCommit.message}`,
			branch: project.branch,
		};
		return await this.deploySvs.newPushDeployment(deployData, project, installationId);
		return { reason: "", status: "" };
	}

	async githubSecondaryEvents(installationId: string, userId: string): Promise<string> {
		const accessToken = this.githubSvcs.createGithubAccessToken();
		console.log(accessToken, " <");

		// console.log(await this.userService.getGithubInstallationInfo(userId))
		// return ""

		const [userGithubData, user] = await Promise.all([
			dispatchRequestService.githubInsatallationVerify(Number(installationId), accessToken),
			this.userService.getUser(userId),
		]);

		if (!user) {
			throw new WebhookError(WEBHOOK_ERRORS.USER_NOT_FOUND + userId, 404);
		}
		if (user.githubAccountId || user.githubInstallationId) {
			if (user.githubInstallationId === Number(installationId)) {
				throw new AppError(WEBHOOK_ERRORS.ALREDY_CONNECTED, STATUS_CODES.BAD_REQUEST);
			}
			throw new WebhookError(WEBHOOK_ERRORS.ALREDY_CONNECTED, STATUS_CODES.BAD_REQUEST);
		}
		const userGithubId = userGithubData.account.id;
		const installId = userGithubData.id;

		if (!installId || !userGithubId) {
			throw new WebhookError(WEBHOOK_ERRORS.INCOMPLETE_DATA + userId, 404);
		}

		await this.userService.addGithubInstallationInfo({ installId, loginId: userGithubId }, user._id);
		console.log("updated user github app");
		return "";
	}

	async removeGhbInstallation(installationId: string, userId: string, skipUserCheck?: boolean): Promise<void> {
		if (skipUserCheck) {
			console.log("Removing github installation due to error");
			const accessToken = this.githubSvcs.createGithubAccessToken();
			const result = await dispatchRequestService.githubInstallationDelete(Number(installationId), accessToken);
			console.log(result);
			return;
		}
		const user = await this.userService.getGithubInstallationInfo(userId);
		if (user?.githubInstallationId !== Number(installationId)) {
			console.log("Removing github installation due to error after user validation");
			const accessToken = this.githubSvcs.createGithubAccessToken();
			const result = await dispatchRequestService.githubInstallationDelete(Number(installationId), accessToken);
			console.log(result);
			return;
		}
	}

	async removeGhbInstallationManual(userId: string): Promise<boolean> {
		const user = await this.userService.getGithubInstallationInfo(userId);
		if (!user) {
			throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		const accessToken = this.githubSvcs.createGithubAccessToken();
		await dispatchRequestService.githubInstallationDelete(user.githubInstallationId, accessToken);
		await this.userService.removeGithubInstallationInfo(user.githubInstallationId);
		return true;
	}
}

export default WebhookService;
