import { USER_ERRORS, WEBHOOK_ERRORS } from "@/constants/errors.js";
import { GithubRepoResponse } from "@/constants/types/github.js";
import { IRedisCache } from "@/interfaces/cache/IRedisCache.js";
import { IDeploymentService } from "@/interfaces/service/IDeploymentService.js";
import { IUserSerivce } from "@/interfaces/service/IUserService.js";
import { IWebhookService } from "@/interfaces/service/IWebhookService.js";
import { IUser } from "@/models/User.js";
import AppError, { WebhookError } from "@/utils/AppError.js";
import dispatchRequestService from "@/utils/dispatchRequest.js";
import { generateTokenForGithubAppInstallation, generateTokenForGithubAppServer } from "@/utils/generateToken.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";

class WebhookService implements IWebhookService {
	private userService: IUserSerivce;
	private cacheService: IRedisCache;
	constructor(userSrvice: IUserSerivce, deploymentService: IDeploymentService, cache: IRedisCache) {
		this.userService = userSrvice;
		this.cacheService = cache;
	}

	async webhookHandleNewRequest(userId: string, redirectPath: string): Promise<string> {
		const user = await this.getUserInfo(userId)
		const token = generateTokenForGithubAppInstallation(user._id.toString(), redirectPath)
		return token
	}

	async webhookInstaltnCreateEvent(installationId: number, account: any): Promise<void> {
		console.log({ installationId, account })
	}

	async webhookInstaltnDeleteEvent(installationId: number, account: any): Promise<void> {
		await this.userService.removeGithubInstallationInfo(installationId)
	}

	async webhookCodePushEvent(installationId: number, account: any): Promise<void> {
		console.log({ installationId, account })
	}




	async getUserInfo(userId: string): Promise<IUser> {
		const user = await this.userService.getUser(userId)
		if (!user) {
			throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND)
		}
		return user
	}



	async githubSecondaryEvents(installationId: string, userId: string): Promise<string> {
		const accessToken = this.createGithubAccessToken()
		console.log(accessToken, " <")

		// console.log(await this.userService.getGithubInstallationInfo(userId))
		// return ""

		const [userGithubData, user] = await Promise.all([
			dispatchRequestService.githubInsatallationVerify(Number(installationId), accessToken),
			this.userService.getUser(userId)
		])

		if (!user) {
			throw new WebhookError(WEBHOOK_ERRORS.USER_NOT_FOUND + userId, 404)
		}
		if (user.githubAccountId || user.githubInstallationId) {
			if (user.githubInstallationId === Number(installationId)) {
				throw new AppError(WEBHOOK_ERRORS.ALREDY_CONNECTED, STATUS_CODES.BAD_REQUEST)
			}
			throw new WebhookError(WEBHOOK_ERRORS.ALREDY_CONNECTED, STATUS_CODES.BAD_REQUEST)
		}
		const userGithubId = userGithubData.account.id
		const installId = userGithubData.id

		if (!installId || !userGithubId) {
			throw new WebhookError(WEBHOOK_ERRORS.INCOMPLETE_DATA + userId, 404)
		}

		const updated = await this.userService.addGithubInstallationInfo({ installId, loginId: userGithubId }, user._id)
		console.log("updated", updated)
		return ""
	}

	async removeGhbInstallation(installationId: string, userId: string, skipUserCheck?: boolean): Promise<void> {

		if (skipUserCheck) {
			console.log("Removing github installation due to error")
			const accessToken = this.createGithubAccessToken()
			const result = await dispatchRequestService.githubInstallationDelete(Number(installationId), accessToken)
			console.log(result)
			return
		}
		const user = await this.userService.getGithubInstallationInfo(userId)
		if (user?.githubInstallationId !== Number(installationId)) {
			console.log("Removing github installation due to error after user validation")
			const accessToken = this.createGithubAccessToken()
			const result = await dispatchRequestService.githubInstallationDelete(Number(installationId), accessToken)
			console.log(result)
			return
		}

	}

	async getUserRepos(userId: string): Promise<GithubRepoResponse[]> {
		const user = await this.userService.getGithubInstallationInfo(userId)
		if (!user) {
			throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND)
		}
		if (!user.githubInstallationId) {
			throw new AppError(WEBHOOK_ERRORS.NOT_CONNECTED, STATUS_CODES.NOT_FOUND)
		}
		const token = this.createGithubAccessToken()
		const installationAccessToken = await this.createInstallationAccessToken(user.githubInstallationId, token)

		console.log({ installationAccessToken })
		const repos = await dispatchRequestService.getUserRepos(installationAccessToken)
		return repos

	}

	createGithubAccessToken(): string {
		return generateTokenForGithubAppServer()
	}

	async createInstallationAccessToken(installationId: number, token: string): Promise<string> {
		const insAccessTokenCacheKey = `installation:${installationId}`

		const tokenFromCache = await this.cacheService.get<string>(insAccessTokenCacheKey)
		if (!tokenFromCache) {
			const accessToken = await dispatchRequestService.getInstallationAccessToken(installationId, token)
			await this.cacheService.set(insAccessTokenCacheKey, accessToken, 60 * 55)
			return accessToken
		}
		return tokenFromCache
	}

}

export default WebhookService;
