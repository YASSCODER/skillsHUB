import express, { Application, Request, Response, NextFunction } from "express";
import logger from "./common/utils/logger";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import appRegisterModules from "./app.register-module";
import salonsRouter from "./modules/salon/api/salon.route";
import sessionsRoutes from './modules/session/api/session.route';
import documentRoute from "./modules/document/api/document.route";

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());
appRegisterModules(app);

app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Server is running!" });
});

app.get("/api/test", (req: Request, res: Response) => {
  res.status(200).json({ message: "API is working!" });
});

app.use('/api/salon', salonsRouter);
app.use('/api/sessions', sessionsRoutes);
app.use("/api/document", documentRoute);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: "Internal Server Error" });
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


export default app;
