/// <reference types="node" />

import connectDB from "../src/config/mongo.config.ts";
import { User } from "../src/models/User.ts";
import { Project } from "../src/models/Projects.ts";
import { Deployment } from "../src/models/Deployment.ts";
import { ProjectBandwidth } from "../src/models/ProjectBandwidths.ts";
import { OtpModel } from "../src/models/Otp.ts";
import mongoose from "mongoose";
import "dotenv/config";

async function createIndexes() {
	try {
		console.log("Starting index creation...");


		console.log("Creating User indexes...");
		await User.collection.createIndex({ email: 1 }, { unique: true, name: "email_unique" });
		await User.collection.createIndex({ stripeCustomerId: 1 }, { sparse: true, name: "stripe_customer_lookup" });
		console.log("✓ User indexes created");
		//-------------------------------------------------------------------------------------------------------------------------------------
		console.log("Creating User OTP indexes...");

		await OtpModel.collection.createIndex({ userId: 1, purpose: 1 }, { unique: true, name: "otp_user_purpose" })
		await OtpModel.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 60 * 10 })
		console.log("✓ User OTP indexes created");

		console.log("Creating Project indexes...");
		await Project.collection.createIndex({ subdomain: 1 }, { unique: true, name: "subdomain_unique" });
		await Project.collection.createIndex({ user: 1, createdAt: -1 }, { name: "user_projects_by_date" });
		console.log("✓ Project indexes created");
		//-------------------------------------------------------------------------------------------------------------------------------------
		console.log("Creating Deployment indexes...");

		await Deployment.collection.createIndex({ project: 1, createdAt: -1 }, { name: "project_deployments_by_date" });
		await Deployment.collection.createIndex({ user: 1, createdAt: -1 }, { name: "user_deployments_by_date" });
		console.log("✓ Deployment indexes created");
		//-------------------------------------------------------------------------------------------------------------------------------------

		console.log("Creating ProjectBandwidth indexes...");
		// await ProjectBandwidth.collection.createIndex(
		// 	{ project: 1, currentMonth: 1 },
		// 	{ unique: true, name: 'project_monthly_bandwidth' }
		// );
		// await ProjectBandwidth.collection.createIndex(
		// 	{ user: 1, currentMonth: 1 },
		// 	{ name: 'user_monthly_bandwidth' }
		// );
		// await ProjectBandwidth.collection.createIndex(
		// 	{ project: 1 },
		// 	{ name: 'project_bandwidth_lookup' }
		// );
		console.log("✓ ProjectBandwidth indexes created");
		//-------------------------------------------------------------------------------------------------------------------------------------
		console.log("\n✅ All indexes created successfully!");
		console.log("\n📋 Index verification:");
		const collections = [
			{ name: "User", model: User },
			{ name: "Project", model: Project },
			{ name: "Deployment", model: Deployment },
			{ name: "ProjectBandwidth", model: ProjectBandwidth },
		];

		for (const { name, model } of collections) {
			const indexes = await model.collection.indexes();
			console.log(`\n${name} (${indexes.length} indexes):`);
			indexes.forEach((idx) => {
				console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
			});
		}
	} catch (error) {
		console.error("❌ Error creating indexes:", error);
		throw error;
	}
}

async function dropIndexes() {
	try {
		console.log("Dropping all custom indexes...");

		await User.collection.dropIndexes();
		await Project.collection.dropIndexes();
		await Deployment.collection.dropIndexes();
		await ProjectBandwidth.collection.dropIndexes();

		console.log("✅ All custom indexes dropped");
	} catch (error) {
		console.error("❌ Error dropping indexes:", error);
		throw error;
	}
}

async function main() {
	const action = process.argv[2];

	try {
		await connectDB();
		console.log("📡 Connected to MongoDB\n");

		if (action === "down") {
			await dropIndexes();
		} else if (action === "up") {
			await createIndexes();
		}

		await mongoose.disconnect();
		console.log("\n📡 Disconnected from MongoDB");
		process.exit(0);
	} catch (error) {
		console.error("Fatal error:", error);
		await mongoose.disconnect();
		process.exit(1);
	}
}

main();

export { createIndexes, dropIndexes };
