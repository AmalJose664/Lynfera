import { webhookController } from "@/instances.js";
import { authenticateToken } from "@/middlewares/authMiddleware.js";

import { Router } from "express";

const githubRouter = Router();

githubRouter.get("/repos", authenticateToken, webhookController.getUserRepos.bind(webhookController))


export default githubRouter