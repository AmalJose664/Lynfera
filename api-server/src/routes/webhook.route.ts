import { webhookController } from "@/instances.js";
import { authenticateToken } from "@/middlewares/authMiddleware.js";
import { decodeGhbStateValue, verifySignature } from "@/middlewares/github.middlewares.js";

import { Router } from "express";

const webhookRouter = Router();

webhookRouter.post("/github", verifySignature, webhookController.githubWebhook.bind(webhookController))

webhookRouter.get("/connect-github", authenticateToken, webhookController.getGithubConnectionUrl.bind(webhookController))

webhookRouter.get("/setup", decodeGhbStateValue, webhookController.githubAppSetup.bind(webhookController))

export default webhookRouter