import app from "./app.js";
import { startCacheInvalidationListener } from "./cache/invalidationHandler.js";
import { redisService } from "./cache/redis.js";
import { validateEnv } from "./config/env.config.js";
import { analyticsClean } from "./utils/analyticsCleaner.js";
const PORT = process.env.PORT || 7000;
const startServer = async () => {
	validateEnv()
	startCacheInvalidationListener()
	app.listen(PORT, () => console.log(`Server running on port ${PORT}\n PID => ${process.pid}`));
};
startServer().catch((e) => console.log(e));


process.once('SIGTERM', () => async () => {
	await analyticsClean()
	await redisService.disconnect()
	process.exit(0);
});
process.once('SIGINT', async () => {
	await analyticsClean()
	await redisService.disconnect()
	process.exit(0);
});

process.once('uncaughtException', async (error) => {
	console.error('Uncaught exception:', error);
	await analyticsClean()
	await redisService.disconnect()
	process.exit(0)
});
