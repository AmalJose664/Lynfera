import { GithubRepoResponse, GithubRepositoryBranch, GithubRepositoryOwner } from "@/constants/types/github.js";

interface toGithubRepoResponse {
	id: number;
	node_id: string;
	name: string;
	full_name: string;
	private: boolean;
	description: string | null;
	html_url: string;
	pushAt: string
}
interface toGithubRepoBranchResponse {
	name: string;
	commit: {
		sha: string;
		url: string;
	},
}
interface toGithubAccountResponse {
	login: string;
	id: number;
	nodeId: string;
	avatarUrl: string;
	htmlUrl: string;
	type: "User" | "Organization";
	siteAdmin: boolean;

}
export class GithubResponseMapper {
	static toGithubAccountResponse(account: GithubRepositoryOwner): { account: toGithubAccountResponse } {
		return {
			account: {
				login: account.login,
				id: account.id,
				nodeId: account.node_id,
				avatarUrl: account.avatar_url,
				htmlUrl: account.html_url,
				siteAdmin: account.site_admin,
				type: account.type
			}
		}
	}
	static toGithubRepoResponse(repos: GithubRepoResponse[]): { repos: toGithubRepoResponse[] } {
		return {
			repos: repos.map(re => ({
				description: re.description,
				id: re.id,
				node_id: re.node_id,
				name: re.name,
				full_name: re.full_name,
				html_url: re.html_url,
				private: re.private,
				pushAt: re.pushed_at
			}))
		}
	}
	static toGithubRepoBranchResponse(branches: GithubRepositoryBranch[]): { branches: toGithubRepoBranchResponse[] } {
		return {
			branches: branches.map(branch => ({
				name: branch.name,
				commit: {
					sha: branch.commit.sha,
					url: branch.commit.url
				}
			}))
		}
	}
}