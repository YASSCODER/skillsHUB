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
    // Enhanced connection options for MongoDB Atlas
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Increased timeout for Atlas
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });

    logger.info("[Database] ✅ Connected to MongoDB Atlas");

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error("[Database] ❌ Connection error:", err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn("[Database] ⚠️ Disconnected from MongoDB");
    });

    mongoose.connection.on('reconnected', () => {
      logger.info("[Database] ✅ Reconnected to MongoDB");
    });

  } catch (err) {
    logger.error("[Database] ❌ Connection error:", err);

    // More detailed error information
    if (err instanceof Error) {
      if (err.message.includes('ECONNREFUSED')) {
        logger.error("[Database] ❌ Connection refused - Check your network connection and MongoDB Atlas cluster status");
      } else if (err.message.includes('authentication failed')) {
        logger.error("[Database] ❌ Authentication failed - Check your MongoDB credentials");
      } else if (err.message.includes('querySrv ECONNREFUSED')) {
        logger.error("[Database] ❌ DNS resolution failed - Check your internet connection and MongoDB Atlas cluster URL");
      }
    }

    throw err; // Re-throw to be handled by the caller
  }
};

export default connectDB;