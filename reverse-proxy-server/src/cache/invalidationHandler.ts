import { projectService } from "../service/project.service.js";
import { redisService } from "./redis.js";


export interface InvalidationMessage {
	type: string;
	slug: string;
}

export const handleCacheInvalidation = (msg: InvalidationMessage): void => {
	const { type, slug } = msg;
	switch (type) {
		case 'project':
			projectService.invalidateSlug(slug)
			break;
		default:
			console.warn(`Unknown invalidation type: ${type}`);
	}
};

export const startCacheInvalidationListener = (): void => {
	redisService.subscribeToInvalidations(handleCacheInvalidation);
	console.log('Cache invalidation listener started');
};