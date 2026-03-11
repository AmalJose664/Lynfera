import { GithubRepoResponse } from "@/constants/types/github.js";

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

export class GithubResponseMapper {
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
}