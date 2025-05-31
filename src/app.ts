import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import passport from "./config/google/google.config";
import jwtStrategy from "./modules/auth/strategies/jwt.strategy";
import mongoose from "mongoose";
import path from "path";
import appRegisterModules from "./app.register-module";
import notificationRoutes from "./common/routes/notification.route";
import { notificationService } from "./common/services/notification.service";
import SessionMessage from "./common/models/sessions.message.schema";
import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { errorHandler } from "./common/middleware/error-handler.middleware";
import salonsRouter from "./modules/salon/api/salon.route";
import sessionsRoutes from "./modules/session/api/session.route";
import documentRoute from "./modules/document/api/document.route";
import calendarRoutes from "./modules/salon/api/calendar.route";

// 1) Create the Express app
const app: Application = express();

// 2) Initialize authentication strategies
jwtStrategy.initialize();
app.use(passport.initialize());

// 3) CORS + Body parsers
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

// 4) Register application modules (routes, controllers, etc.)
appRegisterModules(app);

// 5) Health‐check endpoints
app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Server is running!" });
});
app.get("/api/test", (req: Request, res: Response) => {
  res.status(200).json({ message: "API is working!" });
});

// 6) Static file serving
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 7) API routes
app.use("/api/salons", salonsRouter);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/document", documentRoute);
app.use("/api/calendar", calendarRoutes);
app.use("/api/notifications", notificationRoutes);

// 9) Create HTTP server (needed if you use Socket.IO)
const httpServer = new HttpServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 10) Initialize Socket.IO notifications
notificationService.initialize(io);

io.on("connection", (socket) => {
  console.log("Nouvelle connexion socket:", socket.id);

  socket.on("authenticate", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(
        `Utilisateur ${userId} authentifié sur le socket ${socket.id}`
      );
    }
  });

  socket.on("joinSession", async ({ sessionId, user }) => {
    socket.join(sessionId);
    const messages = await SessionMessage.find({ sessionId })
      .sort({ timestamp: 1 })
      .lean();
    socket.emit("chatHistory", messages);
    socket.to(sessionId).emit("userJoined", user);
  });

  socket.on("sendMessage", async ({ sessionId, user, message }) => {
    const msgData = new SessionMessage({ sessionId, user, message });
    await msgData.save();
    io.to(sessionId).emit("receiveMessage", msgData);
  });

  socket.on("disconnect", () => {
    console.log("Socket déconnecté:", socket.id);
  });
});

// 11) Export both `app` and the underlying HTTP server
export { app, httpServer };
