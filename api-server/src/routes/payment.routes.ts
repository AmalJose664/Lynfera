import { paymentController } from "@/instances.js";
import { authenticateToken } from "@/middlewares/authMiddleware.js";

import express, { Router } from "express";

const paymentRouter = Router();

paymentRouter.post("/checkout", authenticateToken, paymentController.checkout.bind(paymentController));
paymentRouter.post("/cancel", authenticateToken, paymentController.cancelSubscription.bind(paymentController));
paymentRouter.post("/stripe-webhook", paymentController.webhook.bind(paymentController));
paymentRouter.get("/retrieve", authenticateToken, paymentController.validate.bind(paymentController));

export default paymentRouter;
