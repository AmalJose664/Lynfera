import { Request } from "express";
import { STORAGE_FILES_ENDPOINT, STORAGE_FILES_PATH } from "../constants/paths.js";

export const proxyRewriteLocal = (path: string, req: Request) => {

	const project = req.project;
	if (!project) return undefined;
	return `${STORAGE_FILES_PATH}${project._id}/${project.currentDeployment}`
};


export const proxyRewriteCloud = (path: string, req: Request) => {
	const { project, isManualDeployment, manualDeploymentId } = req

	const deploymentTobeSelected = isManualDeployment ? manualDeploymentId : project?.currentDeployment

	const reWriteBaseUrl = `${STORAGE_FILES_ENDPOINT}/${project?._id}/${deploymentTobeSelected}`

	if (!path || path === "/") {
		return `${reWriteBaseUrl}/index.html`;
	}
	const cleanPath = path.split("?")[0]

	if (project?.rewriteNonFilePaths) {
		const isAsset = /\.[a-zA-Z0-9]+$/.test(cleanPath)
		if (isAsset) {
			return `${reWriteBaseUrl}${path}`;
		}
		return `${reWriteBaseUrl}/index.html`;
	}
	return `${reWriteBaseUrl}${cleanPath}`;
}
