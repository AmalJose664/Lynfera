import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { ENVS } from "@/config/env.config.js";
import { STATUS_CODES } from "@/utils/statusCodes.js";
import { WEBHOOK_ERRORS } from "@/constants/errors.js";
import { webhookService } from "@/instances.js";
import { WebhookError } from "@/utils/AppError.js";
import { createHmac, timingSafeEqual } from "crypto";
//user

export const decodeGhbStateValue = async (req: Request, res: Response, next: NextFunction) => {
	const stateValue = req.query.state as string;
	try {
		if (!stateValue) {
			throw new WebhookError(WEBHOOK_ERRORS.INCOMPLE_DATA, STATUS_CODES.BAD_REQUEST);
		}
		const decoded = jwt.verify(stateValue, ENVS.GITHUB_CLIENT_ID + ENVS.GITHUB_WEBHOOK_SECRET);
		req.body = decoded;
		next();
	} catch (error: any) {
		console.log(error);
		try {
			const installationId = req.query.installation_id;

			if (installationId && req.body.user) {
				await webhookService.removeGhbInstallation(String(installationId), req.body.user);
			}
		} catch (error: any) {
			console.log("Instalation remove point");
			console.log(error.message);
			console.log(WEBHOOK_ERRORS.UNINSTALL_ERROR);
		}

		const baseUrl = ENVS.FRONTEND_URL + "/user/";

		const params = new URLSearchParams({
			tab: "provider",
			success: String(false),
			message: WEBHOOK_ERRORS.INCOMPLE_DATA,
		});
		res.status(STATUS_CODES.BAD_REQUEST).redirect(`${baseUrl}?${params.toString()}`);
	}
};

export const verifySignature = async (req: Request, res: Response, next: NextFunction) => {
	const sig = req.headers["x-hub-signature-256"];
	if (!sig) {
		console.error("WEBHOOK GITHUB", WEBHOOK_ERRORS.SIGNATURE_NOT_FOUND);
		return res.status(STATUS_CODES.BAD_REQUEST).json({ message: WEBHOOK_ERRORS.SIGNATURE_NOT_FOUND, status: STATUS_CODES.BAD_REQUEST });
	}
	try {
		const hmac = createHmac("sha256", ENVS.GITHUB_WEBHOOK_SECRET);
		const digest = "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");

		const result = timingSafeEqual(Buffer.from(sig as string), Buffer.from(digest));
		if (!result) {
			throw new WebhookError(WEBHOOK_ERRORS.SIGNATURE_INVALID, STATUS_CODES.BAD_REQUEST);
		}
		next();
	} catch (error) {
		console.log("Signature compare error");
		return res.status(STATUS_CODES.BAD_REQUEST).json({ message: WEBHOOK_ERRORS.SIGNATURE_DECODE_ERROR, status: STATUS_CODES.BAD_REQUEST });
	}
};
