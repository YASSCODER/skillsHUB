import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import appRegisterModules from "./app.register-module";
import logger from "./common/utils/logger";

// Charger les variables d’environnement avant tout
dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(cors());

appRegisterModules(app);

app.get("/", (req, res) => {
  res.send({ message: "Server is running!" });
});

// Middleware d'erreur
app.use((err: any, req: any, res: any, next: any) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
