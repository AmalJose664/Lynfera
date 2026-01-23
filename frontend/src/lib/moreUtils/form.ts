import { RepoProvider } from "@/types/Others"
import axios from "axios"

interface ParsedRepo {
	provider: RepoProvider
	owner: string
	repo: string
}

export const parseRepoUrl = (url: string): ParsedRepo | null => {
	const clean = url.replace(/\.git$/, "").replace(/\/$/, "")
	const parts = clean.split("/")

	if (parts.length < 2) return null

	const repo = parts.pop()!
	const owner = parts.pop()!

	if (clean.includes("github.com")) {
		return { provider: "github", owner, repo }
	}

	if (clean.includes("gitlab.com")) {
		return { provider: "gitlab", owner, repo }
	}

	if (clean.includes("bitbucket.org")) {
		return { provider: "bitbucket", owner, repo }
	}

	return null
}
export const repoCheck = async (repoUrl: string): Promise<boolean> => {
	const parsed = parseRepoUrl(repoUrl)
	if (!parsed) return false

	try {
		let apiUrl = ""

		switch (parsed.provider) {
			case "github":
				apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`
				break

			case "gitlab":
				apiUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(
					`${parsed.owner}/${parsed.repo}`
				)}`
				break

			case "bitbucket":
				apiUrl = `https://api.bitbucket.org/2.0/repositories/${parsed.owner}/${parsed.repo}`
				break
		}

		const res = await axios.get(apiUrl)
		return res.status === 200
	} catch {
		return false
	}
}

export const getBranches = async (
	repoUrl: string,
	setFn: (branches: string[]) => void
) => {
	const parsed = parseRepoUrl(repoUrl)
	if (!parsed) return

	try {
		let apiUrl = ""
		let branchExtractor = (data: any): string[] => []

		switch (parsed.provider) {
			case "github":
				apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/branches`
				branchExtractor = data => data.map((b: any) => b.name)
				break

			case "gitlab":
				apiUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(
					`${parsed.owner}/${parsed.repo}`
				)}/repository/branches`
				branchExtractor = data => data.map((b: any) => b.name)
				break

			case "bitbucket":
				apiUrl = `https://api.bitbucket.org/2.0/repositories/${parsed.owner}/${parsed.repo}/refs/branches`
				branchExtractor = data => data.values.map((b: any) => b.name)
				break
		}
		const res = await axios.get(apiUrl)
		setFn(branchExtractor(res.data))
	} catch (err) {
		console.log("Invalid or unsupported repository")
	}
}
