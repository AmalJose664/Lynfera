export interface ProjectRefined {
	_id: string;
	subdomain: string;
	currentDeployment: string | null;
	tempDeployment: string | null;
	isDeleted: boolean;
	isDisabled: boolean;
	rewriteNonFilePaths: boolean;
}
export interface IProjectService {
	findProjectBySlug(slug: string): Promise<ProjectRefined | null>
}