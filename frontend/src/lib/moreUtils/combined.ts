
export const timeToSeconds = (time: number | undefined) => {
	if (!time) return time
	return (time / 1000).toFixed(2) + " s";
}

export const formatDate = (date: Date | undefined) => { //chat gpt code
	return new Date(date || 0).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
};

export const getElapsedTimeClean = (createdAt: Date | undefined) => { //chat gpt code
	const now = new Date();
	const created = new Date(createdAt || 0);

	const diffMs = Math.abs(now.getTime() - created.getTime());

	const minutes = Math.floor(diffMs / (1000 * 60));
	const hours = Math.floor(diffMs / (1000 * 60 * 60));
	const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const months = Math.floor(days / 30);
	const years = Math.floor(months / 12);

	if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''}`;
	if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`;
	if (days < 30) return `${days} day${days !== 1 ? 's' : ''}`;
	if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
	return `${years} year${years !== 1 ? 's' : ''}`;
};

export const getElapsedTime = (oldTime: Date | string): string => { //chat gpt code
	const diff = Date.now() - new Date(oldTime).getTime();

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days}d `;
	if (hours > 0) return `${hours}h ${minutes % 60}m `;
	if (minutes > 0) return `${minutes}m ${seconds % 60}s `;
	return `${seconds}s `;
};


export const getGithubBranchUrl = (repoUrl: string, branch: string) => { //chat gpt code
	if (repoUrl.includes(".git")) {
		repoUrl = repoUrl.replace(/\.git$/, "");
	}
	return `${repoUrl.replace(/\/$/, '')}/tree/${branch}`;
}

export const getGithubCommitUrl = (repoUrl: string, commitId: string) => { //chat gpt code
	if (repoUrl.endsWith(".git")) {
		repoUrl = repoUrl.replace(/\.git$/, "");
	}
	repoUrl = repoUrl.replace(/\/$/, "");

	return `${repoUrl}/commit/${commitId}`;
};

export const getStatusBg = (status: string): string[] => {
	switch (status) {
		case 'READY':
			return ['bg-emerald-500', 'bg-emerald-400', 'dark:bg-emerald-700 bg-emerald-300'];

		case 'QUEUED':
			return ['bg-amber-300', 'bg-amber-200', 'dark:bg-amber-500 bg-amber-200'];

		case 'BUILDING':
			return ['bg-amber-500', 'bg-amber-400', 'dark:bg-amber-700 bg-amber-400'];

		case 'FAILED':
		case 'CANCELLED':
			return ['bg-red-500', 'bg-red-400', 'dark:bg-red-700 bg-red-400'];

		default:
			return ['bg-gray-500', 'bg-gray-400', 'dark:bg-gray-700 bg-gray-400'];
	}
};

export const getStatusColor = (status: string) => {
	switch (status.toLowerCase()) {
		case 'ready':
			return 'text-emerald-500 bg-emerald-500/10';
		case 'failed':
			return 'text-red-500 bg-red-500/10';
		case 'cancelled':
			return 'text-red-500 bg-red-500/10';
		case 'building':
			return 'text-amber-500 bg-amber-500/10';
		default:
			return 'text-gray-500 bg-gray-500/10';
	}
};
export const getLevelColor = (level: string) => {
	switch (level) {
		case 'ERROR': return 'text-red-400';
		case 'WARN': return 'text-yellow-500';
		case 'SUCCESS': return 'text-green-400';
		case 'DECOR': return 'text-blue-400/90';
		default: return 'text-gray-500';
	}
};


export const formatLogTime = (time: string | Date) => {  //chat gpt code
	const date = new Date(time)
	let hours = date.getHours()
	const minutes = date.getMinutes().toString().padStart(2, "0")
	const seconds = date.getSeconds().toString().padStart(2, "0")

	const ampm = hours >= 12 ? "PM" : "AM"
	hours = hours % 12 || 12

	return `${date.getMonth() + 1}/${date.getDate()} - ${hours}:${minutes}:${seconds} ${ampm}`
}

export const formatDuration = (ms: number) => {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`;
};

export const BLUE_COLORS = [
	"var(--color-blue-600)",
	"var(--color-blue-300)",
	"var(--color-blue-800)",
	"var(--color-blue-400)",
	"var(--color-blue-700)",
	"var(--color-blue-200)",
	"var(--color-blue-900)",
	"var(--color-blue-500)",
	"var(--color-blue-100)",
]


export const formatBytes = (size: number): string => { //chat gpt code
	if (size === 0) return "0 B"
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"]
	const i = Math.floor(Math.log(size) / Math.log(k))
	return `${(size / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function parseGitHubRepo(input: string): string[] { //chat gpt code
	let str = input.trim();
	if (str.endsWith("/")) {
		str = str.slice(0, -1);
	}
	if (str.endsWith(".git")) {
		str = str.slice(0, -4);
	}
	if (str.startsWith("git@")) {
		const parts = str.split(":")[1].split("/");
		return [parts[0], parts[1]];
	}
	try {
		if (str.startsWith("http")) {
			const url = new URL(str);
			const parts = url.pathname.replace(/^\/+/g, "").split("/");
			return [parts[0], parts[1]];
		}
	} catch (e) {
	}
	const parts = str.split("/");
	return [parts[0], parts[1]];
}

export function shortHash(hash: string) {
	return hash.slice(0, 7);
}

export function getPercentage(value: number, limit: number) {
	if (limit === 0) return 0;
	return ((value / limit) * 100);
}