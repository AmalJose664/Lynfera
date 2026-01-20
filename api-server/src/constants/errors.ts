export const USER_ERRORS = {
	NOT_FOUND: "User not found",
	ALREADY_EXISTS: "Email already exists",
	INVALID_CREDENTIALS: "Invalid email or password",
	UNAUTHORIZED: "Unauthorized access",
	ACCOUNT_LOCKED: "Account temporarily locked. Try again later",
	FORBIDDEN: "You do not have permission to perform this action",
	EMAIL_REQUIRED: "Email is required",
	EMAIL_NOT_VERIFIED: "Please verify your email before logging in",
	INVALID_TOKEN: "Invalid or expired token",
	NO_TOKEN: "Token not found",
	LOGIN_REQUIRED: "Login required",
	NOT_AUTHENTICATED: "User not authenticated",
	CALLBACK_ERROR: "Error during google callback",
	CREATION_ERROR: "Error on user sign up",
};

export const PROJECT_ERRORS = {
	NOT_FOUND: "Project not found",
	CREATE_FAILED: "Failed to create project",
	UPDATE_FAILED: "Failed to update project",
	DELETE_FAILED: "Failed to delete project",
	LIMIT_REACHED: "Project limit reached for your account",
	IN_USE: "Cannot delete project while it has active deployments",
	PROJECT_IN_PROGRESS: "Project deployment in progress",
	SUBDOMAIN_NOT_AVAILABLE: "Subdomain not available",
};

export const DEPLOYMENT_ERRORS = {
	NOT_FOUND: "Deployment not found",
	CREATE_FAILED: "Failed to create deployment",
	UPDATE_FAILED: "Failed to update deployment",
	DELETE_FAILED: "Failed to delete deployment",
	DEPLOY_FAILED: "Deployment process failed",
	NO_ACTIVE_DEPLOYMENT: "No active deployment found",
	CONCURRENT_LIMIT: "Maximum concurrent deployments for user reached",
	DAILY_DEPLOYMENT_LIMIT: "Daily deployment limit exceeded",
	BUSY_RUNNERS: "Busy Runners. Please try again later",
	ALREADY_ACTIVE: "Deployment already active",
	NOT_RELATED: "This deployment does not belong to the selected project",
	CANT_MAKE_ACTIVE: (status: string) => `Only successful deployments can be activated. Current status: ${status}.`,
};

export const PAYMENT_ERRORS = {
	NOT_FOUND: "Payment record not found",
	FAILED: "Payment processing failed",
	SUBSCRIPTION_CANCELLED: "Subscription has been cancelled",
	NO_ACTION_TAKEN: "No action taken",
};

export const OTP_ERRORS = {
	GENERATION_FAILED: "Failed to generate OTP",
	SEND_FAILED: "Failed to send OTP",
	INVALID_OTP: "Invalid OTP code",
	EXPIRED: "OTP has expired",
	NOT_FOUND: "OTP not found or expired",
	RESEND_LIMIT: "Too many OTP requests, please try again later",
	VERIFICATION_FAILED: "OTP verification failed",
	MAX_ATTEMPTS: (attempts: number) => `Maximum ${attempts} attempts exceeded`,
	COOLDOWN_ACTIVE: (seconds: number) => `Please wait ${seconds} seconds before requesting a new OTP`,
};

export const COMMON_ERRORS = {
	INTERNAL_SERVER: "Internal server error",
	SOMETHING_WENT_WRONG: "Error; Something went wrong",
	INVALID_ID: (id: string) => "Invalid ID === > " + id,
	VALIDATION_ERRORS: (messages: string, source: string) => `${source} validation error => ${messages}`,
	RATE_LIMIT_EXCEEDED: "Too many requests; please try again later",
	COOKIE_NOT_PROVIDED: "No auth cookie provided",
	TOKEN_VALIDATION: "Error during token valiadation",
	NOT_FOUND: "Not found",
};
