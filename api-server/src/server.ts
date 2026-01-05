import httpServer from "./app.js";
import { redisCacheService } from "./instances.js";
import { validateEnv } from "./config/env.config.js";
import { startKafkaConsumer, stopKafkaConsumer } from "./events/index.js";
import { analyticsService } from "./instances.js";
const PORT = process.env.PORT || 8000;
const startServer = async () => {
	console.log("starting.....");
	validateEnv();
	httpServer.listen(PORT, () => console.log(`🎉🎉 Server running on port ${PORT}`));
	// await startKafkaConsumer()
};

// remove test routes, at logs routes, deployment routes
startServer().catch((e) => {
	console.error("❌ Failed to start server:", e);
	process.exit(1);
});
process.on("SIGINT", async () => {
	console.log("Exiting.........");
	await Promise.all([stopKafkaConsumer(), analyticsService.exitService(), redisCacheService.disconnect()]);
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("Exiting.....");
	await Promise.all([stopKafkaConsumer(), analyticsService.exitService(), redisCacheService.disconnect()]);
	process.exit(0);
});

process.on("exit", (code) => {
	console.log(`🎊🥀 Process exited`);
});
