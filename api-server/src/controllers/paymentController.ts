
import Stripe from "stripe";
import { Request, Response, NextFunction } from "express";


import { IPaymentController } from "@/interfaces/controller/IPaymentController.js";
import { IPaymentService } from "@/interfaces/service/IPaymentService.js";
import { ENVS } from "@/config/env.config.js";
import { HTTP_STATUS_CODE } from "@/utils/statusCodes.js";
import { issueAuthAccessCookies, issueAuthRefreshCookies } from "@/utils/authUtils.js";
import AppError from "@/utils/AppError.js";
import { stripe } from "@/config/stripe.config.js";



class PaymentController implements IPaymentController {
	private paymentService: IPaymentService;
	constructor(service: IPaymentService) {
		this.paymentService = service;
	}
	async checkout(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const successUrl = ENVS.FRONTEND_URL + "/payment-success?session_id=";
			const cancelUrl = ENVS.FRONTEND_URL + "/projects";
			const { session, status } = await this.paymentService.createCheckoutSession(userId, successUrl, cancelUrl);
			if (!session || !status) {
				res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ url: null, message: "No session , already pro member" });
				return;
			}
			res.json({ url: session.url, sessionId: session.id });
		} catch (error) {
			next(error);
		}
	}
	async cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			await this.paymentService.handleCancelSubscription(userId);
			issueAuthAccessCookies(res, { id: userId, plan: "FREE" })
			issueAuthRefreshCookies(res, { id: userId, plan: "FREE" })
			res.json({
				message: "Subscription cancelled successfully",
				status: true,
			});
		} catch (error) {
			next(error);
		}
	}
	async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const sig = req.headers["stripe-signature"];
			let event;
			const endpointSecret = ENVS.STRIPE_WEBHOOK_SECRET as string;

			event = stripe.webhooks.constructEvent(req.body, sig ?? "", endpointSecret);

			await this.paymentService.handleWebhookEvent(event);
			res.json({ received: true });
		} catch (error) {
			next(error);
		}
	}
	async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const sessionId = req.query.session_id;
			const userId = req.user?.id as string;
			const result = await this.paymentService.retriveSession(userId, sessionId as string);
			res.status(200).json({
				valid: result.valid,
				customerName: result.customerName,
				currency: result.currency,
				amountPaid: result.amountPaid,
				paymentStatus: result.paymentStatus,
			});
		} catch (err) {
			const error = err as Stripe.errors.StripeError;
			if (error.type === "StripeInvalidRequestError") {
				return next(new AppError("Payment session not found. It may have expired or is invalid.", 404));
			}

			if (error.type === "StripeAuthenticationError") {
				return next(new AppError("Payment service authentication failed", 500));
			}

			if (error.type === "StripeAPIError") {
				return next(new AppError("Payment service is temporarily unavailable", 503));
			}
			next(err);
		}
	}
}

export default PaymentController;
