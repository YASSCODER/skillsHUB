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
import calendarRoutes from "./modules/salon/api/calendar.route";
import jwtStrategy from "./modules/auth/strategies/jwt.strategy";
import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { notificationService } from './common/services/notification.service';
import notificationRoutes from './common/routes/notification.route';
import SessionMessage from './common/models/sessions.message.schema'
import mongoose from "mongoose"; // Ajoute ceci avec tes imports

dotenv.config();



const app: Application = express();

// Initialiser la stratégie JWT avant de l'utiliser
jwtStrategy.initialize();

app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(cors());

// Augmenter les limites pour les requêtes JSON et URL-encoded
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
appRegisterModules(app);

app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Server is running!" });
});

app.get("/api/test", (req: Request, res: Response) => {
  res.status(200).json({ message: "API is working!" });
});

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use('/api/salons', salonsRouter);
app.use('/api/sessions', sessionsRoutes);
app.use("/api/document", documentRoute);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred:', err);
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    path: req.path
  });
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    path: req.path
  });
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const server = new HttpServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});



// Initialiser le service de notification
notificationService.initialize(io);

io.on('connection', (socket) => {
  console.log('Nouvelle connexion socket:', socket.id);

  // Authentification du socket
  socket.on('authenticate', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`Utilisateur ${userId} authentifié sur le socket ${socket.id}`);
    }
  });

  // Gestion du chat de session
  socket.on('joinSession', async ({ sessionId, user }) => {
    socket.join(sessionId);
    const messages = await SessionMessage.find({ sessionId }).sort({ timestamp: 1 }).lean();
    socket.emit('chatHistory', messages);
    socket.to(sessionId).emit('userJoined', user);
  });

  socket.on('sendMessage', async ({ sessionId, user, message }) => {
    const msgData = new SessionMessage({ sessionId, user, message });
    await msgData.save();
    io.to(sessionId).emit('receiveMessage', msgData);
  });

  socket.on('disconnect', () => {
    console.log('Socket déconnecté:', socket.id);
  });
});

export { app, server };
