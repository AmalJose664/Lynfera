import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
	try {
		const mongouri = process.env.MONGO_URL;
		if (!mongouri) {
			throw new Error("MONGO_URI not found from .env.");
		}
		await mongoose.connect(mongouri);
		console.log("Database connected");
	} catch (error) {
		console.log("Database Connection Failed", error);
		process.exit(1);
	}
};

export default connectDB;
