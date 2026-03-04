import { ENVS } from "@/config/env.config.js";
import { webhookController } from "@/instances.js";
import AppError from "@/utils/AppError.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { createHmac, timingSafeEqual } from "crypto";
import { Router } from "express";


const webhookRouter = Router();

webhookRouter.post("/github", (req, res, next) => {

	const sig = req.headers['x-hub-signature-256']
	if (!sig) {
		console.error("WEBHOOK GITHUB", "No signature found")
		return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "No github signature found", status: STATUS_CODES.BAD_REQUEST })
	}
	try {
		const hmac = createHmac("sha256", ENVS.GITHUB_WEBHOOK_SECRET)
		const digest = "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex")

		const result = timingSafeEqual(Buffer.from(sig as string), Buffer.from(digest))
		if (!result) {
			throw new AppError("Invalid Secret or Signature", 400)
		}
		next()
	} catch (error) {
		console.log("Signature compare error")
		return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "No github signature found ------- Signature compare error", status: STATUS_CODES.BAD_REQUEST })
	}

}, webhookController.githubWebhook.bind(webhookController))


webhookRouter.get("/connect-github", (req, res) => {
	const appSlug = "lynfera-app";

	// Use /installations/new to ensure state is passed back
	const installUrl = `https://github.com/apps/${appSlug}/installations/new?state=hey_guys_how_are_you`;

	res.redirect(installUrl);

})
webhookRouter.get("/post", (req, res) => {
	console.log(req.body, req.query)
	res.json({ ok: true })
})

export default webhookRouter