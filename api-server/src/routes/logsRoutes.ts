import { logsController } from "@/instances.js";
import { authenticateToken } from "@/middlewares/authMiddleware.js";
import { Router } from "express";


const logsRouter = Router();

logsRouter.get("/", authenticateToken, logsController.test.bind(logsController));
logsRouter.get("/data", authenticateToken, logsController.getData.bind(logsController));

export default logsRouter;
