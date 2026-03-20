export type RepoProvider = "github" | "gitlab" | "bitbucket"

export type ParsedRepo = {
	provider: RepoProvider
	owner: string
	repo: string
}

export type SourceLocation = {
	path: string
	startLine?: number
	endLine?: number
}

export type ServerMessages = {
	message: string;
	id: number;
	smallText?: string
	type: "ERROR" | "NEUTRAL" | "SUCCESS" | "WARNING"
}