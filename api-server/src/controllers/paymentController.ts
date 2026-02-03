import Stripe from "stripe";
import { Request, Response, NextFunction } from "express";

import { IPaymentController } from "@/interfaces/controller/IPaymentController.js";
import { IPaymentService } from "@/interfaces/service/IPaymentService.js";
import { ENVS } from "@/config/env.config.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { issueAuthAccessCookies, issueAuthRefreshCookies } from "@/utils/authUtils.js";
import AppError from "@/utils/AppError.js";
import { stripe } from "@/config/stripe.config.js";
import { PAYMENT_ERRORS } from "@/constants/errors.js";
import { FRONTEND_PAYMENT_CANCEL_PATH, FRONTEND_PAYMENT_SUCCESS_PATH } from "@/constants/paths.js";
import { PLANS } from "@/constants/plan.js";

class PaymentController implements IPaymentController {
	private paymentService: IPaymentService;
	constructor(service: IPaymentService) {
		this.paymentService = service;
	}
	async checkout(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			const successUrl = ENVS.FRONTEND_URL + FRONTEND_PAYMENT_SUCCESS_PATH;
			const cancelUrl = ENVS.FRONTEND_URL + FRONTEND_PAYMENT_CANCEL_PATH;
			const { session, status } = await this.paymentService.createCheckoutSession(userId, successUrl, cancelUrl);
			if (!session || !status) {
				res.status(STATUS_CODES.BAD_REQUEST).json({
					url: null,
					message: "No session , already pro member " + PAYMENT_ERRORS.NO_ACTION_TAKEN,
				});
				return;
			}
			res.status(STATUS_CODES.OK).json({ url: session.url, sessionId: session.id });
		} catch (error) {
			next(error);
		}
	}
	async cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const userId = req.user?.id as string;
			await this.paymentService.handleCancelSubscription(userId);
			issueAuthAccessCookies(res, { id: userId, plan: PLANS.FREE.name });
			issueAuthRefreshCookies(res, { id: userId, plan: PLANS.FREE.name }, {originalIssuedAt:Date.now(), currentRefresh: 1});
			res.status(STATUS_CODES.OK).json({
				message: PAYMENT_ERRORS.SUBSCRIPTION_CANCELLED,
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
			res.status(STATUS_CODES.OK).json({ received: true });
		} catch (error) {
			next(error);
		}
	}
	async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const sessionId = req.query.session_id;
			const userId = req.user?.id as string;
			const result = await this.paymentService.retriveSession(userId, sessionId as string);
			const { user } = result
			issueAuthAccessCookies(res, { id: userId, plan: user?.plan as string })
			issueAuthRefreshCookies(res, { id: userId, plan: user?.plan as string }, { originalIssuedAt: Date.now(), currentRefresh: 1 })
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
				return next(new AppError(error.message, error.statusCode || STATUS_CODES.NOT_FOUND));
			}

			if (error.type === "StripeAuthenticationError") {
				return next(new AppError(error.message, error.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR));
			}

			if (error.type === "StripeAPIError") {
				return next(new AppError(error.message, error.statusCode || STATUS_CODES.SERVICE_UNAVAILABLE));
			}
			next(err);
		}
	}
}

export default PaymentController;
