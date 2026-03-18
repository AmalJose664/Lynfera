import { GithubCommitType, GithubRepoResponse, GithubRepositoryBranch, GithubRepositoryOwner } from "@/constants/types/github.js";
import { IUser } from "@/models/User.js";

export interface IGithubService {
	getUserInfo(userId: string): Promise<IUser>;

	createGithubAccessToken(): string;
	createOrGetInstallationAcsTokn(installationId: number, token?: string): Promise<string>;

	getUserRepos(userId: string): Promise<GithubRepoResponse[]>;
	getUserRepo(userId: string, owner: string, repo: string): Promise<GithubRepoResponse>;
	getUserRepoBranches(userId: string, owner: string, repo: string): Promise<GithubRepositoryBranch[]>;
	getUserAccountData(userId: string): Promise<GithubRepositoryOwner>;
}
