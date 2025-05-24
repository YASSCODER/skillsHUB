import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../common/utils/logger";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("⚠️ MONGO_URI is not defined in .env file");
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });

    logger.info("[Database] ✅ Connected to MongoDB Atlas");
  } catch (err) {
    logger.error("[Database] ❌ Connection error: " + err);
    process.exit(1);
  }
};

export default connectDB;