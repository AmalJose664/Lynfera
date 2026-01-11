export const PROJECT_POPULATE_MAP = {
	user: {
		path: "user",
		select: "name email profileImage"
	},
	deployments: {
		path: "deployments",
		select: "status createdAt"
	}
} as const

export const projectBasicFields = ["name",
	"branch",
	"repoURL",
	"techStack",
	"status",
	"currentDeployment",
	"tempDeployment",
	"lastDeployment",
	"subdomain",
	"user",
	"deployments",
	"lastDeployedAt",
	"createdAt",]

export const projectSettingsFields = [
	"_id", "name", "branch", "repoURL", "status", "subdomain", "user",
	"createdAt", "buildCommand", "env", "outputDirectory", "rootDir", "isDisabled", "isDeleted", "rewriteNonFilePaths"
]

export const projectUpdateFieldsString = ["name", "_id"]