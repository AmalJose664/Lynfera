import { Request, Response, NextFunction } from "express";
export interface IWebhookController {
	githubWebhook(req: Request, res: Response, next: NextFunction): Promise<void>
}
