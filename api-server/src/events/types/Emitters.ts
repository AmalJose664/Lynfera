import { Response } from "express";

export interface IDeploymentEmitter {
	onEvent(e: string, cb: (log: any) => void): void | Promise<void>;
	offEvent(e: string, cb: (log: any) => void): void | Promise<void>;
	emitEvents(e: string, log: any, type: string): void | Promise<void>;
	offAllEvents(e: string): void | Promise<void>;
	setMaxListeners(n: number): void;
	eventNames(): (string | symbol)[];
	listeners(name: string | symbol): Function[];
}

export interface SSEClient {
	deploymentId: string;
	res: Response;
	listener: (data: any) => void;
	errors: number;
}
