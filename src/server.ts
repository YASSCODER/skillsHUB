import logger from "./common/utils/logger";
import app from "./app";
import dotenv from "dotenv";
import connectDB from "./config/database.config";
import { errorHandler } from "./common/middleware/error-handler.middleware";
import type { ErrorRequestHandler } from "express";

dotenv.config();

const PORT = process.env.PORT || 3000;

// ✅ Register the error handling middleware before starting the server
// Make sure to import 'app' as an Express.Application instance
// and register the error handler after all other middleware/routes
app.use(errorHandler as unknown as ErrorRequestHandler);

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
