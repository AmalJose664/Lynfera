import { IWebhookController } from "@/interfaces/controller/IWebhookController.js";
import { IWebhookService } from "@/interfaces/service/IWebhookService.js";

import { STATUS_CODES } from "@/utils/statusCodes.js";
import { Request, Response, NextFunction } from "express";

class WebhookController implements IWebhookController {
	private webhookService: IWebhookService;

	constructor(webhookService: IWebhookService) {
		this.webhookService = webhookService;
	}


	async githubWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { body } = req
			const eventType = String(req.headers["x-github-event"])
			console.log("*************************************************",
				body, req.headers, "*************************************************")
			switch (eventType) {
				case "push":
					// push tasks 
					if (body.created) {
						// new branch/tag
					}

					if (body.deleted) {
						// deleted branch/tag
					}

					break
				case "installation":
					const action = body.action
					switch (action) {
						case "created":
							this.webhookService
							break

						case "deleted":
							// remove db entry
							break
					}
					break
			}


			res.json({ hai: "hey" })


		} catch (error) {
			next(error);
		}
	}
}

export default WebhookController;
