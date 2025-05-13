import { Application, Request, Response, NextFunction } from "express";
import logger from "./common/utils/logger";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import appRegisterModules from "./app.register-module";
import salonsRouter from "./modules/salon/api/salon.route";
import sessionsRoutes from './modules/session/api/session.route';
dotenv.config();

const app: Application = express();

// Configurez CORS pour autoriser les requêtes provenant du front-end
app.use(
  cors({
    origin: 'http://localhost:4200', // URL du front-end
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cors());

// Middleware pour parser les requêtes JSON
app.use(express.json());
// ✅ Enregistrer les routes/modules
appRegisterModules(app);

// ✅ Route de vérification de santé
app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Server is running!" });
});

// ✅ Ajoutez un endpoint de test simple
app.get("/api/test", (req: Request, res: Response) => {
  res.status(200).json({ message: "API is working!" });
});
// Routes
app.use('/api/salon', salonsRouter);
// ✅ Gestion globale des erreurs
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: "Internal Server Error" });
});
app.use('/api/sessions', sessionsRoutes);

export default app;