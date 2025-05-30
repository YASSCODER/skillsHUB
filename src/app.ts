import { Application, Request, Response, NextFunction } from "express";
import logger from "./common/utils/logger";
import cors from "cors";
import dotenv from "dotenv";
import appRegisterModules from "./app.register-module";
import salonsRouter from "./modules/salon/api/salon.route";
import sessionsRoutes from './modules/session/api/session.route';
import express from "express";
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
);// Middleware pour parser les requêtes JSapp.use(express.json());
// Ajoutez après la configuration CORS
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com data:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
  );
  next();
});
// ✅ Enregistrer les routes/modules
appRegisterModules(app);

// Ajoutez cette ligne pour déboguer les routes enregistrées (safely)
try {
  if (app._router && app._router.stack) {
    console.log('Routes registered:', app._router.stack.filter((r: any) => r.route).map((r: any) => r.route.path));
  } else {
    console.log('Router not yet initialized');
  }
} catch (error: any) {
  console.log('Could not access router stack:', error?.message || 'Unknown error');
}

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
