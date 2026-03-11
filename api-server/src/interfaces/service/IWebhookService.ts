import { GithubRepoResponse } from "@/constants/types/github.js"
import { IUser } from "@/models/User.js"

export interface IWebhookService {
	webhookHandleNewRequest(userId: string, redirectPath: string): Promise<string>

	webhookInstaltnCreateEvent(installationId: number, account: any): Promise<void>
	webhookInstaltnDeleteEvent(installationId: number, account: any): Promise<void>

	getUserInfo(userId: string): Promise<IUser>

	githubSecondaryEvents(installationId: string, userId: string): Promise<string>
	removeGhbInstallation(installationId: string, userId: string, skipUserCheck?: boolean): Promise<void>

	createGithubAccessToken(): string
	createInstallationAccessToken(installationId: number, token: string): Promise<string>

	getUserRepos(userId: string): Promise<GithubRepoResponse[]>
}
