import { RepoProvider } from "@/types/Others"
import axios from "axios"
import axiosInstance from "../axios"

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
export const repoCheck = async (repoUrl: string, isPrivate?: boolean, times = 1): Promise<boolean> => {
	if (times > 3) {
		return false
	}
	const parsed = parseRepoUrl(repoUrl)
	if (!parsed) return false
	if (isPrivate) {
		console.log({ times }, " < <")
		const response = await axiosInstance.get(`/github/repos/${parsed.owner}/${parsed.repo}`)
		const data = response.data
		return true
	}
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
		if (res.status === 200) {
			return true
		}
		else { return false }
	} catch (error: any) {
		if (error.status === 403) {
			return await repoCheck(repoUrl, true, times + 1)
		}
		return false
	}
}

export const getBranches = async (
	repoUrl: string,
	isPrivate: boolean,
	times = 1
): Promise<string[]> => {
	if (times > 3) {
		return []
	}
	let apiUrl = ""
	let branchExtractor = (data: any): string[] => []

	const parsed = parseRepoUrl(repoUrl)
	if (!parsed) return []

	if (isPrivate) {
		const response = await axiosInstance.get(`/github/repos/${parsed.owner}/${parsed.repo}/branches`,)
		const data = response.data
		branchExtractor = data => data.map((b: any) => b.name)
		return branchExtractor(data.branches)
	}
	try {

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
		return branchExtractor(res.data)
	} catch (error: any) {
		if (error.status === 403) {
			await getBranches(repoUrl, true, times + 1)
		}
		console.warn("Invalid or unsupported repository")
		return []
	}
}
