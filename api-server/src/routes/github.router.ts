import { webhookController } from "@/instances.js";
import { authenticateToken } from "@/middlewares/authMiddleware.js";

import { Router } from "express";

const githubRouter = Router();

githubRouter.get("/account", authenticateToken, webhookController.getUserAccountData.bind(webhookController))

githubRouter.get("/repos", authenticateToken, webhookController.getUserRepos.bind(webhookController))
githubRouter.get("/repos/:owner/:repo", authenticateToken, webhookController.getUserRepo.bind(webhookController))
githubRouter.get("/repos/:owner/:repo/branches", authenticateToken, webhookController.getUserRepoBranches.bind(webhookController))


export default githubRouter