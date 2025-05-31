import "dotenv/config"; // ← MUST be first so process.env is populated
import mongoose from "mongoose";
import { httpServer } from "./app"; // pulls in the configured server with Socket.IO
import logger from "./common/utils/logger";

const PORT = Number(process.env.PORT || 3000);
const MONGO_URI = process.env.MONGO_URI!;

// 1) Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    logger.info("✅ Connected to MongoDB Atlas");

    // 2) Start listening on a single port
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
