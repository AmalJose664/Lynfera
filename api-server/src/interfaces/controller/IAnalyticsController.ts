import { Request, Response, NextFunction } from "express";
export interface IAnalyticsController {
	bandWidth(req: Request, res: Response, next: NextFunction): Promise<void>;
	realtime(req: Request, res: Response, next: NextFunction): Promise<void>;
	platformStats(req: Request, res: Response, next: NextFunction): Promise<void>;
	topPages(req: Request, res: Response, next: NextFunction): Promise<void>;
	overview(req: Request, res: Response, next: NextFunction): Promise<void>;
}
