import "./config/env.config.js";
import httpServer from "./app.js";
import { intervalManager, redisCacheService } from "./instances.js";
import { startKafkaConsumer, stopKafkaConsumer } from "./events/index.js";
import { ENVS } from "@/config/env.config.js";
import { cpus, freemem, loadavg, totalmem } from "os";
const PORT = ENVS.PORT || 8000;

const startServer = async () => {
	console.log("starting.....app id " + process.pid);
	if (ENVS.NODE_ENV === "production") {
		const totalMem = totalmem() / 1024 ** 3;
		const freeMem = freemem() / 1024 ** 3;
		const cpuCores = cpus().length;
		const load = loadavg(); // [1m, 5m, 15m]

		console.log(`Server started `);
		console.log(`CPU cores: ${cpuCores}`);
		console.log(`Load avg: ${load}`);
		console.log(`RAM total: ${totalMem.toFixed(2)} GB`);
		console.log(`RAM free: ${freeMem.toFixed(2)} GB`);
	}
	httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
	await startKafkaConsumer();
};

startServer().catch((e) => {
	console.error("Failed to start server:", e);
	process.exit(1);
});
process.on("SIGINT", async () => {
	console.log("Exiting.........");
	await Promise.all([stopKafkaConsumer(), intervalManager.exitService(), redisCacheService.disconnect()]);
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("Exiting.....");
	await Promise.all([stopKafkaConsumer(), intervalManager.exitService(), redisCacheService.disconnect()]);
	process.exit(0);
});

process.on("exit", (code) => {
	console.log(`Process exited`);
});
