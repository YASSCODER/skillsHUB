import mongoose from "mongoose";
import logger from "./common/utils/logger";
import app from "./app";
import dotenv from "dotenv";

dotenv.config(); // Charger .env en haut

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/myDatabase";

// ✅ Fonction pour connecter à MongoDB
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI); // Supprimez les options dépréciées
    logger.info("[Database] Connected to MongoDB");

    app.listen(PORT, () => {
      logger.info(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error("[Database] Connection error: " + err);
    process.exit(1); // Arrêter l'application si la connexion échoue
  }
};

// ✅ Lancer le serveur Express après la connexion à MongoDB
const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`[Express] Server running on port ${PORT}`);
  });
};

// ✅ Démarrer le serveur
startServer();
