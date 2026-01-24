export function validateEnv() {
	const alwaysRequired = [
		"MONGO_URL",
		"OWN_DOMAIN",
		"KAFKA_USERNAME",
		"KAFKA_PASSWORD",
		"STORAGE_MODE", // either cloud or local, use local for your own s3 like storage server, 
		// eg "https://github.com/AmalJose664/Deployment-site/tree/main/test-server"
		// Or use cloud storage like s3 or cloduflare r2 or any other
		"REDIS_URL",
		"FRONTEND_URL"
	];

	const cloudRequired = [
		"CLOUD_STORAGE_BASE_URL",  // url to get static files, (needed for cloudflare)
		"CLOUD_STORAGE_BUCKET_NAME", // bucket
		"CLOUD_STORAGE_SERVER_ACCESS_KEY", // keys
		"CLOUD_STORAGE_SERVER_ACCESS_SECRET", // secrets
		"CLOUD_STORAGE_SERVER_ENDPOINT", // storage server endpoint
	];

	const localRequired = [
		"LOCAL_STORAGE_BASE_URL", // if not using cloud storage , custom server url
	];
	const storageMode = process.env.STORAGE_MODE;

	if (!["cloud", "local"].includes(storageMode!)) {
		console.error("STORAGE_MODE must be either 'cloud' or 'local'");
		process.exit(1);
	}
	const required =
		storageMode === "cloud"
			? [...alwaysRequired, ...cloudRequired]
			: [...alwaysRequired, ...localRequired];

	const missing = required.filter(key => !process.env[key]);

	if (missing.length > 0) {
		console.error("❌ Missing required environment variables:");
		console.error(missing.join(", "));
		process.exit(1);
	}

	console.log(`Environment validated (STORAGE_MODE=${storageMode})`);
}