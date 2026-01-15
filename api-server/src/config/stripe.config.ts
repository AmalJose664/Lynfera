import { ENVS } from "@/config/env.config.js";
import Stripe from "stripe";
export const stripe = new Stripe(ENVS.STRIPE_SECRET_KEY as string);
