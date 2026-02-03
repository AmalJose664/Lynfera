import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProjectBandwiths extends Document {
	user: Types.ObjectId;
	project: Types.ObjectId;
	currentMonth: string;
	bandwidthMonthly: number;
	bandwidthTotal: number;
	createdAt: Date;
	updatedAt: Date;
}

const projectBandwidthsSchema = new Schema<IProjectBandwiths>(
	{
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
		currentMonth: { type: String, default: "" },
		bandwidthMonthly: { type: Number, default: 0 },
		bandwidthTotal: { type: Number, default: 0 },
	},
	{
		timestamps: true,
	},
);

export const ProjectBandwidth = mongoose.model<IProjectBandwiths>("ProjectBandwidth", projectBandwidthsSchema);
