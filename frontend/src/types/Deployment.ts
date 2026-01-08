import { Project, ProjectStatus } from "./Project";
import { User } from "./User";

export interface Deployment {
	_id: string;
	project: Partial<Project> | string;
	commit: { id: string, msg: string };
	user: string | Partial<User>;
	status: ProjectStatus;
	performance: {
		installTime: number;
		buildTime: number;
		totalDuration: number;
	}
	overWrite: boolean;
	completedAt: Date;
	identifierSlug: string;
	errorMessage?: string;
	createdAt: Date;
	updatedAt: Date;
}
export interface DeploymentFilesType {
	_id: string;
	fileStructure?: {
		totalSize: number;
		files: {
			name: string;
			size: number;
		}[]
	}
}
export interface DeploymentUpdates {
	deploymentId: string;
	projectId: string;
	status?: ProjectStatus;
	techStack?: string;
	commit_hash?: string;
	error_message?: string;
	install_ms?: number;
	build_ms?: number;
	duration_ms?: number;
	complete_at?: string;

}