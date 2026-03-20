import { USER_ERRORS, WEBHOOK_ERRORS } from "@/constants/errors.js";
import { GithubRepoResponse, GithubRepositoryBranch, GithubRepositoryOwner } from "@/constants/types/github.js";
import { IRedisCache } from "@/interfaces/cache/IRedisCache.js";
import { IGithubService } from "@/interfaces/service/IGithubService.js";

import { IUserSerivce } from "@/interfaces/service/IUserService.js";

import { IUser } from "@/models/User.js";
import AppError from "@/utils/AppError.js";
import dispatchRequestService from "@/utils/dispatchRequest.js";
import { generateTokenForGithubAppServer } from "@/utils/generateToken.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";

class GithubService implements IGithubService {
	private userService: IUserSerivce;
	private cacheService: IRedisCache;
	constructor(userSrvice: IUserSerivce, cache: IRedisCache) {
		this.userService = userSrvice;
		this.cacheService = cache;
	}

	async getUserInfo(userId: string): Promise<IUser> {
		const user = await this.userService.getUser(userId);
		if (!user) {
			throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		return user;
	}

	async getUserRepos(userId: string): Promise<GithubRepoResponse[]> {
		const user = await this.userService.getGithubInstallationInfo(userId);
		if (!user) {
			throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		if (!user.githubInstallationId) {
			throw new AppError(WEBHOOK_ERRORS.NOT_CONNECTED, STATUS_CODES.NOT_FOUND);
		}
		const token = this.createGithubAccessToken();
		const installationAccessToken = await this.createOrGetInstallationAcsTokn(user.githubInstallationId, token);

		const repos = await dispatchRequestService.getUserRepos(installationAccessToken);
		return repos;
	}
	async getUserRepoBranches(userId: string, owner: string, repo: string): Promise<GithubRepositoryBranch[]> {
		const user = await this.userService.getGithubInstallationInfo(userId);
		if (!user) {
			throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		if (!user.githubInstallationId) {
			throw new AppError(WEBHOOK_ERRORS.NOT_CONNECTED, STATUS_CODES.NOT_FOUND);
		}
		const token = this.createGithubAccessToken();
		const installationAccessToken = await this.createOrGetInstallationAcsTokn(user.githubInstallationId, token);

		const repos = await dispatchRequestService.getUserRepoBranches(installationAccessToken, owner, repo);
		return repos;
	}

	createGithubAccessToken(): string {
		return generateTokenForGithubAppServer();
	}

	async createOrGetInstallationAcsTokn(installationId: number, token?: string): Promise<string> {
		const insAccessTokenCacheKey = `installation:${installationId}`;

		const tokenFromCache = await this.cacheService.get<string>(insAccessTokenCacheKey);
		if (!tokenFromCache) {
			const accessToken = await dispatchRequestService.getInstallationAccessToken(installationId, token || this.createGithubAccessToken());
			await this.cacheService.set(insAccessTokenCacheKey, accessToken, 60 * 55);
			return accessToken;
		}
		return tokenFromCache;
	}

	async getUserRepo(userId: string, owner: string, repo: string): Promise<GithubRepoResponse> {
		const user = await this.userService.getGithubInstallationInfo(userId);
		if (!user) {
			throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		if (!user.githubInstallationId) {
			throw new AppError(WEBHOOK_ERRORS.NOT_CONNECTED, STATUS_CODES.NOT_FOUND);
		}
		const token = this.createGithubAccessToken();
		const installationAccessToken = await this.createOrGetInstallationAcsTokn(user.githubInstallationId, token);

		return dispatchRequestService.getUserRepo(installationAccessToken, owner, repo);
	}

	async getUserAccountData(userId: string): Promise<GithubRepositoryOwner> {
		const user = await this.userService.getGithubInstallationInfo(userId);
		if (!user) {
			throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		}
		if (!user.githubInstallationId || !user.githubAccountId) {
			throw new AppError(WEBHOOK_ERRORS.NOT_CONNECTED, STATUS_CODES.NOT_FOUND);
		}
		const token = this.createGithubAccessToken();
		const account = await dispatchRequestService.getUserAccountConnected(token, user.githubInstallationId);
		return account;
	}
}

export default GithubService;
