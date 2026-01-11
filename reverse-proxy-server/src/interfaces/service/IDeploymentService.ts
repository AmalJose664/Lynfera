export interface IDeploymentService {
	findDeploymentByPublicId(publicId: string): Promise<DeploymentResult | null>
	invalidateSlug(publicId: string): boolean
}

export interface DeploymentResult {
	_id: string;
	projectId: string;
}