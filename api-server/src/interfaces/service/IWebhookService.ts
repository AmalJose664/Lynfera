import { GithubCommitType, GithubRepoResponse, GithubRepositoryBranch, GithubRepositoryOwner } from "@/constants/types/github.js";
import { IUser } from "@/models/User.js";

export interface IWebhookService {
	webhookHandleNewRequest(userId: string, redirectPath: string): Promise<string>;

	webhookInstaltnCreateEvent(installationId: number, account: GithubRepositoryOwner, repos: GithubRepoResponse[]): Promise<void>;
	webhookInstaltnDeleteEvent(installationId: number, account: GithubRepositoryOwner, repos: GithubRepoResponse[]): Promise<void>;
	webhookRepositoryAddRemove(added: GithubRepoResponse[], removed: GithubRepoResponse[]): Promise<void>;
	webhookCodePushEvent(
		repo: GithubRepoResponse,
		meta: {
			sender: GithubRepositoryOwner;
			installationId: number;
			headCommit: GithubCommitType;
			ref: string;
			allChanges: string[];
			deployRequired: boolean;
		},
	): Promise<{ status: string; reason: string }>;
	webhookCheckRunReRequestEvent(
		repo: GithubRepoResponse,
		meta: {
			sender: GithubRepositoryOwner;
			installationId: number;
			headCommitId: string;
		},
	): Promise<{ status: string; reason: string }>;

	githubSecondaryEvents(installationId: string, userId: string): Promise<string>;
	removeGhbInstallation(installationId: string, userId: string, skipUserCheck?: boolean): Promise<void>;
	removeGhbInstallationManual(userId: string): Promise<boolean>;
}
