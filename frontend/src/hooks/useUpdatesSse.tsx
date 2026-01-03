import { deployemntApis } from "@/store/services/deploymentApi";
import { projectApis } from "@/store/services/projectsApi";
import { addLog, addLogs } from "@/store/slices/logSlice";
import { useAppDispatch } from "@/store/store";
import { Deployment, DeploymentUpdates } from "@/types/Deployment";
import { Log } from "@/types/Log";
import { Project, ProjectStatus } from "@/types/Project";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { IoIosArrowRoundForward } from "react-icons/io";
import { MdOutlineError } from "react-icons/md";
import { toast } from "sonner";


export function useDeploymentSSE(project: Project | undefined, refetch: () => void,
	sseActive: boolean, setSseActive: (state: boolean) => void, deployment?: Deployment,) {
	const dispatch = useAppDispatch();
	const eventSourceRef = useRef<EventSource | null>(null)
	const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const logBatchRef = useRef<Log[]>([]);
	const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!sseActive) { return console.log("sse", sseActive) }
		if (!deployment?._id || !deployment.status) { return console.log("depl") }
		if (eventSourceRef.current) { return console.log("eventsource") }
		if (
			deployment.status !== ProjectStatus.BUILDING &&
			deployment.status !== ProjectStatus.QUEUED
		) {
			{ return console.log("status") }
		}

		console.log("Starting SSE for deployment:", deployment._id)
		const eventSource = new EventSource(
			`${process.env.NEXT_PUBLIC_API_SERVER_ENDPOINT}/deployments/${deployment._id}/logs/stream`,
			{ withCredentials: true }
		)
		eventSourceRef.current = eventSource
		eventSource.onmessage = (event) => {
			try {
				const receivedData = JSON.parse(event.data)
				console.log(receivedData)
				if (receivedData.type === "LOG") {
					logBatchRef.current.push(receivedData.data as Log);
					if (batchTimerRef.current) clearTimeout(batchTimerRef.current);
					batchTimerRef.current = setTimeout(() => {
						if (logBatchRef.current.length > 0) {
							dispatch(addLogs(logBatchRef.current));
							logBatchRef.current = [];
						}
					}, 100);
					// dispatch(addLog(receivedData.data as Log))
				} else if (receivedData.type === "UPDATE") {
					const update = receivedData.data as DeploymentUpdates
					dispatch(
						deployemntApis.util.updateQueryData(
							"getDeploymentById",
							{ id: update.deploymentId, params: {} },
							(draft) => {
								Object.entries({
									status: update.status,
									commitHash: update.commit_hash,
									completedAt: update.complete_at,
									errorMessage: update.error_message,
								}).forEach(([key, value]: [string, any]) => {
									if (value) (draft as any)[key] = value
								})

								if (update.install_ms || update.build_ms || update.duration_ms) {
									draft.performance = {
										...draft.performance,
										...(update.install_ms && { installTime: update.install_ms }),
										...(update.build_ms && { buildTime: update.build_ms }),
										...(update.duration_ms && { totalDuration: update.duration_ms })
									}
								}
							}
						)
					)
					dispatch(
						projectApis.util.updateQueryData(
							"getProjectById",
							{ id: update.projectId, params: { include: "user" } },
							(draft) => {
								const newData = {
									status: update.status,
									...(update.techStack && { techStack: update.techStack }),
									...(update.status === ProjectStatus.READY && {
										currentDeployment: update.deploymentId,
										// tempDeployment: null
									})
								}
								Object.assign(draft, newData)
							}
						)
					)
					if (update.status === ProjectStatus.READY ||
						update.status === ProjectStatus.FAILED || update.status === ProjectStatus.CANCELED) {
						refreshTimerRef.current = setTimeout(() => {
							console.log("refeching...........")
							update.status === ProjectStatus.READY
								? toast.success("New Deployment resulted in Success 🎉🎉")
								: toast.custom((t) => (
									<div className="border-red-400 bg-background border px-4 py-3 rounded-md shadow flex justify-between items-center gap-12 w-80">
										<div>
											<div className="flex items-center gap-4">
												<h4 className="font-semibold text-primary">Deployment Failed</h4>
												<MdOutlineError className="size-5 text-red-500" />
											</div>
											<div className="">
												<Link
													href={`/deployments/${update.deploymentId || ""}`}
													className="flex items-center gap-1"
												>
													<p className="text-sm text-blue-400 hover:text-blue-600 no-underline hover:underline">
														View error logs
													</p>
													<IoIosArrowRoundForward className="size-5" />
												</Link>
											</div>
										</div>

										<button
											onClick={() => {
												toast.dismiss(t);
												if (project && project.deployments && project.deployments?.length >= 2) {
													toast.info("Current deployment unchanged, no update was applied")
												}
											}}
											className="text-gray-400 hover:text-gray-600 transition"
										>
											✕
										</button>
									</div>
								), {
									duration: 1000 * 10,
									richColors: true,
									onAutoClose(t) {
										if (project && project.deployments && project.deployments?.length >= 2) {
											toast.info("Current deployment unchanged, no update was applied")
										}
									},
								});
							refetch()
							eventSource.close()
							setSseActive(false)
						}, 1300)
						console.log("end here .... ... .")
					}
				}
			} catch (err) {
				console.error("parse error:  ", err)
			}
		}

		eventSource.onerror = (error) => {
			console.log(eventSource.readyState)
			if (eventSource.readyState === EventSource.CLOSED) {
				console.log('SSE connection closed by server');
				eventSource.close();
				eventSourceRef.current = null
				return;
			}
			if (eventSource.readyState === EventSource.CONNECTING) {
				console.log('SSE reconnecting...');
				return;
			}
			eventSourceRef.current = null
			console.log('SSE connection failed');
			eventSource.close();
		};

		eventSource.addEventListener("done", () => {
			eventSource.close();
			console.log('SSE connection closed by server');
			eventSourceRef.current = null
		})
		eventSource.addEventListener("close", () => {
			eventSource.close();
			console.log('SSE connection closed by server');
			eventSourceRef.current = null
		})
		return () => {
			eventSource.close(); eventSourceRef.current = null
			console.log("closed sse.............")
			if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
		}
	}, [deployment?._id, sseActive])
	return null
}