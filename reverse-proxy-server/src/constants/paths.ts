
export const BUCKET_NAME = process.env.CLOUD_STORAGE_BUCKET_NAME

// --------------------------------------------------
// Storage mode
// --------------------------------------------------
export const STORAGE_MODE =
	process.env.STORAGE_MODE === "cloud" ? "cloud" : "local"

// --------------------------------------------------
// Base URLs (provided via environment variables)
// --------------------------------------------------
export const CLOUD_STORAGE_BASE_URL =
	process.env.CLOUD_STORAGE_BASE_URL

export const LOCAL_STORAGE_BASE_URL =
	process.env.LOCAL_STORAGE_BASE_URL

// --------------------------------------------------
// Storage paths
// --------------------------------------------------
export const CLOUD_STORAGE_PATH = "__app_build_outputs"
export const LOCAL_STORAGE_PATH = "projects"

// --------------------------------------------------
// Resolved storage server URL (common)
// --------------------------------------------------
export const STORAGE_BASE_URL =
	STORAGE_MODE === "cloud"
		? CLOUD_STORAGE_BASE_URL
		: LOCAL_STORAGE_BASE_URL

// --------------------------------------------------
// Resolved files endpoint (common)
// --------------------------------------------------
export const STORAGE_FILES_ENDPOINT = `${STORAGE_BASE_URL}/${STORAGE_MODE === "cloud"
	? CLOUD_STORAGE_PATH
	: LOCAL_STORAGE_PATH
	}`
export const STORAGE_FILES_PATH = `${STORAGE_MODE === "cloud"
	? CLOUD_STORAGE_PATH
	: LOCAL_STORAGE_PATH
	}`
// --------------------------------------------------
// Safety checks (fail fast)
// --------------------------------------------------
export const ownDomain = process.env.OWN_DOMAIN

export const subdomainDelimeter = "--"