
import { Router } from "express";

const baseRouter = Router();
baseRouter.get("/", (req, res) => {
	res.status(200).json({
		"status": "ok",
		"service": "lynfera-backend",
	});
	return;
});

export default baseRouter;
