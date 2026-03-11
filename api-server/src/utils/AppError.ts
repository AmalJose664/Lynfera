class AppError extends Error {
	public statusCode: number;
	public cause?: unknown;
	constructor(message: string, code: number, err?: any) {
		super(message);
		this.statusCode = code;
		this.name = "AppError";
		this.cause = err;
		Error.captureStackTrace(this, this.constructor);
	}
}

export default AppError;
export class WebhookError extends Error {
	public code: number;
	public cause?: unknown;
	constructor(message: string, code: number, err?: any) {
		super("WebhookError   => " + message);
		this.code = code;
		this.name = "WebhookError";
		this.cause = err;
		Error.captureStackTrace(this, this.constructor);
	}
}

