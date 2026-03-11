import { Request, Response, NextFunction } from "express";
export interface IWebhookController {
	githubWebhook(req: Request, res: Response, next: NextFunction): Promise<void>
	getGithubConnectionUrl(req: Request, res: Response, next: NextFunction): Promise<void>
	getUserRepos(req: Request, res: Response, next: NextFunction): Promise<void>
	githubAppSetup(req: Request, res: Response, next: NextFunction): Promise<void>
}
