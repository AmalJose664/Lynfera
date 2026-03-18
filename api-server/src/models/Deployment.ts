import mongoose, { Document, Schema, Types } from "mongoose";

export enum DeploymentStatus {
	NOT_STARTED = "NOT_STARTED",
	QUEUED = "QUEUED",
	BUILDING = "BUILDING",
	READY = "READY",
	FAILED = "FAILED",
	CANCELED = "CANCELLED",
}
export interface FileStructureType {
	totalSize: number;
	files: {
		name: string;
		size: number;
	}[];
}
enum EnvsAvailable {
	development = "development",
	staging = "staging",
	production = "production",
}
export enum DeploymentTriggers {
	GIT_PUSH = "GIT_PUSH",
	MANUAL = "MANUAL",
	REDEPLOY = "REDEPLOY",
}

export interface IDeployment extends Document {
	_id: string;
	project: Types.ObjectId;
	commit_hash: string;
	publicId: string;
	user: Types.ObjectId;
	status: DeploymentStatus;
	environment: EnvsAvailable;

	timings: {
		install_ms: number;
		build_ms: number;
		duration_ms: number;
		upload_ms: number;
	};
	overWrite: boolean;
	complete_at: Date;
	identifierSlug: string;
	error_message?: string;
	branch: string;
	triggerEvent: DeploymentTriggers;
	triggeredBy?: string;
	file_structure: FileStructureType | null;
	createdAt: Date;
	updatedAt: Date;
}

const deploymentSchema = new Schema<IDeployment>(
	{
		project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
		publicId: { type: String, required: true, unique: true },
		status: { type: String, enum: Object.values(DeploymentStatus), default: DeploymentStatus.NOT_STARTED },
		identifierSlug: { type: String, required: true },
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		commit_hash: { type: String, required: true },
		environment: {
			type: String,
			enum: Object.values(EnvsAvailable),
			default: EnvsAvailable.production,
			required: true,
		},
		timings: {
			type: {
				upload_ms: { type: Number, default: 0 },
				install_ms: { type: Number, default: 0 },
				build_ms: { type: Number, default: 0 },
				duration_ms: { type: Number, default: 0 },
			},
			default: () => ({}),
			_id: false,
		},
		overWrite: { type: Boolean, required: true },
		error_message: { type: String },
		triggerEvent: { type: String, enum: Object.values(DeploymentTriggers), default: DeploymentTriggers.MANUAL },
		triggeredBy: { type: String, required: false },
		branch: { type: String, required: false },
		file_structure: {
			type: {
				totalSize: { type: Number, default: 0 },
				files: [
					{
						name: { type: String, required: true },
						size: { type: Number, default: 0 },
						_id: false,
					},
				],
			},
			default: null,
			_id: false,
		},
		complete_at: { type: Date },
	},
	{ timestamps: true },
);

export const Deployment = mongoose.model<IDeployment>("Deployment", deploymentSchema);
