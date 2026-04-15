import { redisEmitterPublisher, redisEmitterSubscriber } from "@/config/redis.config.js";
import { EventEmitter } from "events";
import { Response, Request } from "express";
import { Redis } from "ioredis";
import { IDeploymentEmitter, SSEClient } from "./types/Emitters.js";
import { ENVS } from "@/config/env.config.js";

class DeploymentEmitter extends EventEmitter implements IDeploymentEmitter {
	onEvent(eventString: string, callback: (log: any) => void) {
		this.on(eventString, callback);
	}
	offEvent(eventString: string, callback: (log: any) => void) {
		this.off(eventString, callback);
	}
	emitEvents(eventString: string, log: any, type: string) {
		const emitData = { type, data: log };
		this.emit(eventString, emitData);
	}

	offAllEvents(eventString: string) {
		this.removeAllListeners(eventString);
	}
}

class RedisDeploymentEmitter implements IDeploymentEmitter {
	private sub: Redis;
	private pub: Redis;
	private localInternalEmitter: EventEmitter;
	constructor(publisher: Redis, subscriber: Redis) {
		this.pub = publisher;
		this.sub = subscriber;
		this.localInternalEmitter = new EventEmitter();
		this.start();
	}
	private start() {
		this.sub.on("message", (channel, message) => {
			try {
				const parsed = JSON.parse(message);
				this.localInternalEmitter.emit(channel, parsed);
			} catch (error) {
				console.log("Error on Redis message parsing...", channel);
			}
		});
		console.log("Started sub on------------------------");
	}
	async onEvent(eventString: string, callback: (log: any) => void) {
		if (this.localInternalEmitter.listenerCount(eventString) === 0) {
			await this.sub.subscribe(eventString);
		}
		this.localInternalEmitter.on(eventString, callback);
	}

	async offEvent(eventString: string, callback: (log: any) => void) {
		this.localInternalEmitter.off(eventString, callback);
		if (this.localInternalEmitter.listenerCount(eventString) === 0) {
			await this.sub.unsubscribe(eventString);
		}
	}
	async emitEvents(eventString: string, log: any, type: string) {
		const emitData = { type, data: log };
		const str = JSON.stringify(emitData);
		await this.pub.publish(eventString, str);
	}

	async offAllEvents(eventString: string) {
		await this.sub.unsubscribe(eventString);
		this.localInternalEmitter.removeAllListeners(eventString);
	}

	setMaxListeners(n: number) {
		this.localInternalEmitter.setMaxListeners(n);
	}
	eventNames() {
		return this.localInternalEmitter.eventNames();
	}
	listeners(name: string | symbol) {
		return this.localInternalEmitter.listeners(name);
	}
}

console.log("Using redis emiter = ", ENVS.USE_REDIS_EMITTER);
export const deploymentEmitter = ENVS.USE_REDIS_EMITTER
	? new RedisDeploymentEmitter(redisEmitterPublisher, redisEmitterSubscriber)
	: new DeploymentEmitter();

class SSEManager {
	private emitter: DeploymentEmitter | RedisDeploymentEmitter;
	private clients: Map<string, SSEClient>;
	private interval: NodeJS.Timeout;

	constructor() {
		this.emitter = deploymentEmitter;
		this.emitter.setMaxListeners(1000);
		this.clients = new Map<string, SSEClient>();
		this.interval = setInterval(() => {
			const clients = this.clients.entries();
			for (const [client, data] of clients) {
				try {
					data.res.write(`:heartbeat\n\n`);
				} catch (error) {
					console.log("Error on heartbeat SSEClient");
					this.removeClient(client);
				}
			}
		}, 30 * 1000);
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
			listener,
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
		this.emitter.offAllEvents(deplomentId);
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
		console.log("Clean up SSE Map");
		for (const [clientId] of this.clients) {
			this.removeClient(clientId);
		}
		clearInterval(this.interval);
	}
}

export const sseManager = new SSEManager();
