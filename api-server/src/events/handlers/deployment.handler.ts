import { deploymentService, logsService, projectService } from "@/instances.js";
import { DeploymentLogEvent, DeploymentUpdatesEvent } from "@/events/schemas/deployment.schema.js";
import { deploymentEmitter } from "@/events/deploymentEmitter.js";
import { UpdateTypes } from "@/events/types/event.js";
import { ProjectStatus } from "@/models/Projects.js";

class DeploymentEventHandler {
	static async handleLogs(event: DeploymentLogEvent, isRetry: boolean): Promise<void> {
		//service call
		const { data } = event;

		const { log, deploymentId, projectId } = data;
		if (!isRetry) {
			deploymentEmitter.emitLog(deploymentId, {
				event_id: event.eventId,
				deployment_id: deploymentId,
				project_id: projectId,
				...log,
			});
		}
		console.log("logs inserted...", `${log.level === "INFO" ? log.message : "-"}`);

		await logsService.__insertLog(log.message, projectId, deploymentId, new Date(log.timestamp), log.level, log.sequence);
		//stream
	}

	static async handleUpdates(event: DeploymentUpdatesEvent, isRetry: boolean): Promise<void> {
		//service call
		const { data } = event;
		const { updates, deploymentId, projectId } = data;
		console.log("Updates >>>>", data.updateType, `Deployment => ${deploymentId}, Project => ${projectId}`);
		if (!isRetry) {
			deploymentEmitter.emitUpdates(deploymentId, {
				...updates,
				deploymentId,
				projectId,
			});
		}

		switch (data.updateType) {
			case UpdateTypes.START: {
				await deploymentService.__updateDeployment(projectId, deploymentId, {
					status: updates.status,
					commit_hash: updates.commit_hash,
				});
				await projectService.__updateProjectById(projectId, {
					status: updates.status as unknown as ProjectStatus,
				});
				break;
			}
			case UpdateTypes.END: {
				await deploymentService.decrementRunningDeplymnts(projectId)
				await deploymentService.__updateDeployment(projectId, deploymentId, {
					status: updates.status,
					complete_at: new Date(updates.complete_at || ""),
					...(updates.commit_hash && { commit_hash: updates.commit_hash }),
					timings: {
						install_ms: updates.install_ms || 0,
						build_ms: updates.build_ms || 0,
						upload_ms: updates.upload_ms || 0,
						duration_ms: updates.duration_ms || 0,
					},

					file_structure: {
						files: updates.file_structure?.files || [],
						totalSize: updates.file_structure?.totalSize || 0,
					},
				});
				await projectService.__updateProjectById(projectId, {
					status: updates.status as unknown as ProjectStatus,
					techStack: updates.techStack,
					tempDeployment: null,
					...(updates.status === "READY" && { currentDeployment: deploymentId }),
				});
				break;
			}
			case UpdateTypes.ERROR: {
				await deploymentService.decrementRunningDeplymnts(projectId)
				await deploymentService.__updateDeployment(projectId, deploymentId, {
					status: updates.status,
					error_message: updates.error_message,
				});
				await projectService.__updateProjectById(
					projectId,
					{
						status: updates.status as unknown as ProjectStatus,
						tempDeployment: null,
					},
					{ updateStatusOnlyIfNoCurrentDeployment: true },
				);
				break;
			}
			case UpdateTypes.CUSTOM: {
				await Promise.all([
					deploymentService.__updateDeployment(projectId, deploymentId, {
						status: updates.status,
						...updates,
						complete_at: new Date(updates.complete_at || ""),
					}),
					projectService.__updateProjectById(projectId, {
						status: updates.status as unknown as ProjectStatus,
						techStack: updates.techStack,
					}),
				]);
				break;
			}
			default: {
				console.log("Undefined Update type");
			}
		}
	}
}

export default DeploymentEventHandler;
