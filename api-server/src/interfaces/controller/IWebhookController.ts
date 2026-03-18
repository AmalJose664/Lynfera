import { Request, Response, NextFunction } from "express";
export interface IWebhookController {
	githubWebhook(req: Request, res: Response, next: NextFunction): Promise<void>;
	getGithubConnectionUrl(req: Request, res: Response, next: NextFunction): Promise<void>;
	getUserRepos(req: Request, res: Response, next: NextFunction): Promise<void>;
	githubAppSetup(req: Request, res: Response, next: NextFunction): Promise<void>;

	getUserAccountData(req: Request, res: Response, next: NextFunction): Promise<void>;
	getUserRepoBranches(req: Request, res: Response, next: NextFunction): Promise<void>;
	getUserRepos(req: Request, res: Response, next: NextFunction): Promise<void>;
	getUserRepo(req: Request, res: Response, next: NextFunction): Promise<void>;

	removeGithubApp(req: Request, res: Response, next: NextFunction): Promise<void>;
}
