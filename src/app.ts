import { Application } from "express";
import logger from "./common/utils/logger";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import appRegisterModules from "./app.register-module";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.url}`);
  next();
});

appRegisterModules(app);

app.get("/", (req, res) => {
  res.send({ message: "Server is running!" });
});

app.use((err: any, req: any, res: any, next: any) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
