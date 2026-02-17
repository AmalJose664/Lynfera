import { EventEmitter } from "events";
import { Response, Request } from "express";

class DeploymentEmitter extends EventEmitter {

	onEvent(eventString: string, callback: (log: any) => void) {
		this.on(eventString, callback);
	}
	offEvent(eventString: string, callback: (log: any) => void) {
		this.off(eventString, callback);
	}
	emitEvents(eventString: string, log: any, type: string) {
		const emitData = { type, data: log }
		this.emit(eventString, emitData)
	}


	offAllEvents(eventString: string) {
		this.removeAllListeners(eventString);
	}
}
export const deploymentEmitter = new DeploymentEmitter();


interface SSEClient {
	deploymentId: string;
	res: Response;
	listener: (data: any) => void;
	errors: number;
}

class SSEManager {
	private emitter: DeploymentEmitter;
	private clients: Map<string, SSEClient>;
	private interval: NodeJS.Timeout

	constructor() {
		this.emitter = deploymentEmitter;
		this.emitter.setMaxListeners(1000);
		this.clients = new Map<string, SSEClient>();
		this.interval = setInterval(() => {
			const clients = this.clients.entries()
			for (const [client, data] of clients) {
				try {
					data.res.write(`:heartbeat\n\n`);
				} catch (error) {
					console.log("Error on heartbeat SSEClient");
					this.removeClient(client);
				}
			}
		}, 30 * 1000)
	}

	addClient(clientId: string, deploymentId: string, res: Response, req: Request) {
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");
		res.setHeader("X-Accel-Buffering", "no");

		res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

		req.on("close", () => {
			this.removeClient(clientId);
		});

		const listener = (event: any) => {
			try {
				res.write(`data: ${JSON.stringify(event)}\n\n`);
			} catch (error) {
				const old = this.clients.get(clientId) as SSEClient;
				console.log("Error on data sending SSEClient");
				if (old.errors > 3) {
					this.removeClient(clientId);
					// this.emitter.offAllEvents(deploymentId);
					return;
				}
				this.clients.set(clientId, { ...old, errors: old.errors + 1 });
			}
		};

		this.emitter.onEvent(deploymentId, listener);


		this.clients.set(clientId, {
			deploymentId,
			res,
			errors: 0,
			listener
		});

		console.log(`Client connected: ${clientId}, Active clients: ${this.clients.size}`);
	}

	removeClient(clientId: string) {
		const client = this.clients.get(clientId);
		if (!client) return;

		this.emitter.offEvent(client.deploymentId, client.listener);

		try {
			if (!client.res.writableEnded) {
				client.res.write('event: close\ndata: {"status":"complete"}\n\n');
				client.res.end();
			}
		} catch (error) {
			console.log("Error on client remove SSEClient");
			this.emitter.offAllEvents(client.deploymentId);
		}

		this.clients.delete(clientId);

		console.log(`Client removed: ${clientId}, Active clients: ${this.clients.size}, ${this.clients}`);
	}

	closeClientsByDeployment(deplomentId: string) {
		this.emitter.offAllEvents(deplomentId)
	}

	getClientCount(): number {
		return this.clients.size;
	}

	getListeners(): (string | symbol)[] {
		const names = this.emitter.eventNames();
		return names;
	}
	getEventFns(): any {
		const names = this.emitter.eventNames();
		const arr = names.map((name) => ({
			eventString: name,
			fns: this.emitter.listeners(name).map((fn) => fn.toString()),
		}));
		return arr;
	}

	cleanup() {
		console.log("Clean up SSE Map")
		for (const [clientId] of this.clients) {
			this.removeClient(clientId);
		}
		clearInterval(this.interval)
	}
}

export const sseManager = new SSEManager();
