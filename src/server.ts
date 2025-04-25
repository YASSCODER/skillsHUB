import mongoose from "mongoose";
import logger from "./common/utils/logger";
import app from "./app";
import dotenv from "dotenv";

dotenv.config(); // Charger .env en haut

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/myDatabase";

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("[Database] Connected to MongoDB");

    app.listen(PORT, () => {
      logger.info(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error("[Database] Connection error: " + err);
    process.exit(1);
  }
};

startServer(); // Lancer le serveur
