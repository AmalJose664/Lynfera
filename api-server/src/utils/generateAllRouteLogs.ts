import { ENVS } from "@/config/env.config.js"
import { Request } from "express";

const generateAllRouteLogs = (req: Request) => {
	if (ENVS.NODE_ENV === "production") {
		process.stdout.write("_-_ ")
		return
	}
	const time = new Date();
	console.log(`\n----${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}----- ${req.path} ------${req.method}`);
}
export default generateAllRouteLogs