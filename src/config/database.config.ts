import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../common/utils/logger";

dotenv.config();

// Utiliser l'URI de MongoDB Atlas ou une valeur par défaut pour MongoDB local
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skillsHub";

const connectDB = async () => {
  try {
    // Utiliser 127.0.0.1 au lieu de localhost pour éviter les problèmes IPv6
    const uri = MONGO_URI.replace('localhost', '127.0.0.1');
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Augmenter le timeout
    });

    logger.info("[Database] ✅ Connected to MongoDB");
  } catch (err) {
    logger.error("[Database] ❌ Connection error: " + err);
    process.exit(1);
  }
};

export default connectDB;