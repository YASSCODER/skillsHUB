import logger from "./common/utils/logger";
import app from "./app";
import dotenv from "dotenv";
import connectDB from "./config/database.config";

dotenv.config();

const PORT = process.env.PORT || 3000;

// ✅ Start the server after connecting to MongoDB
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start the Express server
    app.listen(PORT, () => {
      logger.info(`[Express] Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("[Server] Failed to start server:", error);
    process.exit(1);
  }
};

// ✅ Start the server
startServer();
