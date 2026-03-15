export const githubAppSlug = "lynfera-app";
export const githubAppId = 2973065;

export const installationIdVerifyUrl = "https://api.github.com/app/installations/"
export const newAccessTokensUrl = (id: number) => `https://api.github.com/app/installations/${id}/access_tokens`

export const reposUrl = "https://api.github.com/installation/repositories"
export const makeRepoUr = (owner: string, repo: string) => `https://api.github.com/repos/${owner}/${repo}`
export const makeRepoBranchUr = (owner: string, repo: string) => `https://api.github.com/repos/${owner}/${repo}/branches`

export const GITHUB_ACCEPT_HEADER = "application/vnd.github+json"