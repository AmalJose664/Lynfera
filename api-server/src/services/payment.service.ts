import Stripe from "stripe";

import { IPaymentService } from "@/interfaces/service/IPaymentService.js";
import { IUserRepository } from "@/interfaces/repository/IUserRepository.js";
import AppError from "@/utils/AppError.js";
import { stripe } from "@/config/stripe.config.js";
import { SubscriptionStatus } from "@/models/User.js";
import { IPlans, PLANS } from "@/constants/plan.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { PAYMENT_ERRORS, USER_ERRORS } from "@/constants/errors.js";

class PaymentService implements IPaymentService {
	private userRepo: IUserRepository;
	constructor(userRepo: IUserRepository) {
		this.userRepo = userRepo;
	}
	async createCheckoutSession(
		userId: string,
		successUrl: string,
		cancelUrl: string,
	): Promise<{ session: Stripe.Checkout.Session | null; status: boolean }> {
		const user = await this.userRepo.findByUserId(userId);
		if (!user) throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		if (user.plan === PLANS.PRO.name) {
			return {
				session: null,
				status: false,
			};
		}
		let stripeCustomerId = user.stripeCustomerId;

		if (!stripeCustomerId) {
			const customer = await stripe.customers.create({
				email: user.email,
				metadata: { userId: user._id.toString() },
			});

			stripeCustomerId = customer.id;
			await this.userRepo.updateUser(user._id, { stripeCustomerId });
		}
		const session = await stripe.checkout.sessions.create({
			mode: "subscription",
			customer: stripeCustomerId,
			line_items: [{ price: "price_1SaX6n2efzyFmja4tb11B8Cs", quantity: 1 }],
			success_url: successUrl + "{CHECKOUT_SESSION_ID}",
			cancel_url: cancelUrl,
			metadata: {
				userId: String(user._id),
			},
			client_reference_id: String(user._id),
		});
		return { session, status: true };
	}
	async handleCancelSubscription(userId: string): Promise<void> {
		const user = await this.userRepo.findByUserId(userId);
		if (!user) throw new AppError(USER_ERRORS.NOT_FOUND, STATUS_CODES.NOT_FOUND);
		if (user.plan === PLANS.FREE.name) throw new AppError(PAYMENT_ERRORS.NO_ACTION_TAKEN, STATUS_CODES.CONFLICT);
		if (!user.payment?.subscriptionId) {
			throw new AppError(PAYMENT_ERRORS.NOT_FOUND, STATUS_CODES.CONFLICT);
		}
		const result = await stripe.subscriptions.cancel(user.payment?.subscriptionId as string);
		console.log(result);
	}
	async retriveSession(
		userId: string,
		sessionId: string,
	): Promise<{
		valid: boolean;
		customerName: string;
		currency: string | null;
		amountPaid?: number;
		paymentStatus: string;
	}> {
		const session = await stripe.checkout.sessions.retrieve(sessionId);
		console.log(session);
		return {
			valid: session.payment_status === "paid",
			customerName: session.customer_details?.name || "",
			...(session.amount_total && { amountPaid: session.amount_total / 100 }),
			currency: session.currency,
			paymentStatus: session.payment_status,
		};
	}

	async handleWebhookEvent(event: Stripe.Event): Promise<void> {
		switch (event.type) {
			case "checkout.session.completed":
				break;
			case "invoice.payment_succeeded":
				await this.handePaymentSucceed(event);
				break;
			case "customer.subscription.created":
				await this.handleSubscriptionCreate(event);
				break;
			case "customer.subscription.deleted":
				await this.handleSubscriptionDeleted(event);
				break;

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}
	}
	async handleSubscriptionCreate(event: Stripe.Event): Promise<void> {
		const subscription = event.data.object as Stripe.Subscription;
		const stripeUserId = subscription.customer as string;
		if (stripeUserId) {
			await this.userRepo.updateUserPlansWithStripe(stripeUserId as string, PLANS.PRO.name as keyof IPlans, {
				subscriptionStatus: SubscriptionStatus.active,
				subscriptionId: subscription.id,
			});
		}
	}
	async handePaymentSucceed(event: Stripe.Event): Promise<void> {
		console.log("Monthly payment received -> email");
	}
	async handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
		const subscription = event.data.object as Stripe.Subscription;
		const stripeUserId = subscription.customer as string;
		const user = await this.userRepo.findUserByCustomerId(stripeUserId);
		if (user) {
			await this.userRepo.updateUser(user._id, {
				plan: PLANS.FREE.name as keyof IPlans,
				payment: { subscriptionId: null, subscriptionStatus: SubscriptionStatus.cancelled },
			});
		}
		console.log("Payment succed ,, 🎉🎉🎉 payment deleted  event:");
	}
}

export default PaymentService;
