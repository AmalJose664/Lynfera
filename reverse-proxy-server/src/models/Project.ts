import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEnvVar {
	name: string;
	value: string;
}
export enum ProjectStatus {
	NOT_STARTED = "NOT_STARTED",
	QUEUED = "QUEUED",
	BUILDING = "BUILDING",
	READY = "READY",
	FAILED = "FAILED",
	CANCELED = "CANCELLED",
}
export interface IProject extends Document {
	user: Types.ObjectId;
	name: string;
	repoURL: string;
	subdomain: string;
	buildCommand: string;
	installCommand: string;
	techStack?: string;
	branch: string;
	rootDir: string;
	outputDirectory: string;
	currentDeployment: string | null;
	tempDeployment: string | null;
	lastDeployment: string | null;
	env: IEnvVar[];
	lastDeployedAt?: Date;
	status: ProjectStatus;
	deployments?: Types.ObjectId[];
	isDeleted: boolean;
	isDisabled: boolean;
	rewriteNonFilePaths: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
	{
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		name: { type: String, required: true },
		repoURL: { type: String, required: true },
		subdomain: { type: String, required: true, unique: true },
		buildCommand: { type: String, required: true, default: "build" },
		branch: { type: String, required: true, default: "main" },
		rootDir: { type: String, required: true, default: "/" },
		installCommand: { type: String, required: true, default: "install" },
		techStack: { type: String },
		outputDirectory: { type: String, required: true, default: "dist" },
		currentDeployment: { type: String, default: null },
		tempDeployment: { type: String, default: null },
		lastDeployment: { type: String, default: null },
		env: [{ name: String, value: String }],
		lastDeployedAt: { type: Date, default: Date.now() },
		isDeleted: { type: Boolean, default: false },
		isDisabled: { type: Boolean, default: false },
		rewriteNonFilePaths: {
			type: Boolean,
			default: false
		},
		status: {
			type: String,
			required: true,
			enum: Object.values(ProjectStatus),
			default: ProjectStatus.NOT_STARTED,
		},
		deployments: [{ type: Schema.Types.ObjectId, ref: "Deployment" }],
	},
	{
		timestamps: true,
	},
);

export const Project = mongoose.model<IProject>("Project", projectSchema);


export interface IUser extends Document {
	name: string;
	email: string;
	profileImage: string;
	googleId: string;
	plan: string;
	projects: number;
	deploymentsToday: number
	currentDate: string;
	createdAt: Date;
	updatedAt: Date;
}

const userSchema = new Schema<IUser>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		profileImage: { type: String, required: true },
		googleId: { type: String, required: true, unique: true },
		plan: { type: String, required: true, default: "FREE" },
		projects: { type: Number, required: true, default: 0 },
		deploymentsToday: { type: Number, required: true, default: 0 },
		currentDate: { type: String, required: true, default: () => new Date().toISOString().slice(0, 10) }
	},
	{ timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);
