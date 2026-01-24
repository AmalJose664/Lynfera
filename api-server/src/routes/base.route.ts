
import { nanoid } from "@/utils/generateNanoid.js";
import { Router } from "express";

const baseRouter = Router();
baseRouter.get("/", (req, res) => {
	res.status(200).json({
		status: "Working",
		message: "Welcome to lynfera backend.",
		randomNumber: Math.floor(Math.random() * 1000000),
		randomSmallId: nanoid(10)
	});
	return;
});

export default baseRouter;
