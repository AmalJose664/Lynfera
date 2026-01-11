export const DEPLOYMENT_POPULATE_MAP = {
	user: {
		path: "user",
		select: "name email profileImage"
	},
	project: {
		path: "project",
		select: "name branch subdomain repoURL"
	}
} as const

export const deploymentBasicFields = ["_id", "project", "commit_hash", "publicId", "status", "identifierSlug",]