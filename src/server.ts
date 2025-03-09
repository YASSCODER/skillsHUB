import mongoose from "mongoose";
import logger from "./common/utils/logger";
import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/myDatabase";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("[Database] Connected to MongoDB");
  } catch (err) {
    logger.error("[Database] Connection error: " + err);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`[Express] Server running on port ${PORT}`);
  });
};

startServer();
