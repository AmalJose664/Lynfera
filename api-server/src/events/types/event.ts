import { EachBatchHandler, EachBatchPayload } from "kafkajs";
import { ZodObject } from "zod";

export type EventHandler<T, T2> = (event: T2, isRetry: boolean) => T;

export enum EventTypes {
	DEPLOYMENT_LOG = "DEPLOYMENT_LOG",
	DEPLOYMENT_UPDATES = "DEPLOYMENT_UPDATES",
}
export enum UpdateTypes {
	START = "START",
	ERROR = "ERROR",
	CUSTOM = "CUSTOM",
	END = "END",
}
export type CustomEachBatchHandler<HandlerReturnType, HandlerDataTypeParsed> = (
	payload: EachBatchPayload,
	config: EventConfig<HandlerReturnType, HandlerDataTypeParsed>,
) => Promise<void>;

export interface EventConfig<HandlerReturnType, HandlerDataTypeParsed> {
	topic: string;
	schema: ZodObject;
	mode: "batch" | "single";
	handler: EventHandler<HandlerReturnType, HandlerDataTypeParsed>;
	processFn: (data: any | unknown, config: EventConfig<HandlerReturnType, HandlerDataTypeParsed>) => Promise<void>;
	consumer: CustomEachBatchHandler<HandlerReturnType, HandlerDataTypeParsed>;
}
