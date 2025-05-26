import express, { Application, Request, Response, NextFunction } from "express";
import logger from "./common/utils/logger";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import appRegisterModules from "./app.register-module";
import salonsRouter from "./modules/salon/api/salon.route";
import sessionsRoutes from "./modules/session/api/session.route";
import documentRoute from "./modules/document/api/document.route";
import { errorHandler } from "./common/middleware/error-handler.middleware";

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(cors());

app.use(express.json());
appRegisterModules(app);

app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Server is running!" });
});

app.get("/api/test", (req: Request, res: Response) => {
  res.status(200).json({ message: "API is working!" });
});

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

export default app;
