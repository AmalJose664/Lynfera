export type GithubRepoResponse = {
	id: number;
	node_id: string;
	name: string;
	full_name: string;
	private: boolean;

	owner: GithubRepositoryOwner;

	html_url: string;
	description: string | null;
	fork: boolean;

	url: string;

	created_at: string;
	updated_at: string;
	pushed_at: string;

	git_url: string;
	ssh_url: string;
	clone_url: string;

	default_branch: string;

	visibility: "public" | "private" | "internal";

	forks_count: number;
	stargazers_count: number;
	watchers_count: number;

	open_issues_count: number;

	language: string | null;

	archived: boolean;
	disabled: boolean;

	permissions?: GithubRepositoryPermissions;
};
type commitInnerUser = {
	name: string;
	email: string;
	date: string;
	username: string;
};
export interface GithubCommitType {
	id: string;
	message: string;
	timestamp: string;
	url: string;
	author: commitInnerUser;
	committer: commitInnerUser;
	added: string[];
	removed: string[];
	modified: string[];
}
export interface GithubRepositoryOwner {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	html_url: string;
	type: "User" | "Organization";
	site_admin: boolean;
}

export interface GithubRepositoryPermissions {
	admin: boolean;
	maintain?: boolean;
	push: boolean;
	triage?: boolean;
	pull: boolean;
}

export interface GithubRepositoryBranch {
	name: string;
	commit: {
		sha: string;
		url: string;
	};
	protected: boolean;
}
