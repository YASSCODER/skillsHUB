import { Router, Request, Response } from "express";
import { SessionController } from "./session.controller";
import catchAsync from "../../../common/utils/catch-async.utils";
import Salon from '../../../common/models/salon.schema';
import Session from '../../../common/models/session.schema';
const router = Router();
const sessionController = new SessionController();

// ➕ Créer une session
router.get('/search', catchAsync((req: Request, res: Response) => sessionController.searchSessions(req, res)));

router.post("/:salonNom", catchAsync((req: Request, res: Response) => sessionController.createSession(req, res)));
// 📋 Récupérer toutes les sessions
router.get("/", catchAsync((req: Request, res: Response) => sessionController.getAllSessions(req, res)));

// 🔍 Récupérer une session par ID
router.get("/:id", catchAsync((req: Request, res: Response) => sessionController.getSessionById(req, res)));

// 🔄 Mettre à jour une session par ID
router.put("/:id", catchAsync((req: Request, res: Response) => sessionController.updateSession(req, res)));
// 🗑️ Supprimer une session par ID
router.delete("/:id", catchAsync((req: Request, res: Response) => sessionController.deleteSession(req, res)));

// 🔍 Récupérer les sessions par utilisateur
router.get("/user/:userId", catchAsync((req: Request, res: Response) => sessionController.getSessionsByUser(req, res)));

// 🔢 Compter les sessions par salon
router.get("/count/by-salon/:salonId", catchAsync((req: Request, res: Response) => sessionController.countSessionsBySalon(req, res)));

// 🔍 Récupérer les sessions par type (chat ou meet)
router.get("/type/:type", catchAsync((req: Request, res: Response) => sessionController.getSessionsByType(req, res)));

// ⏱️ Récupérer la durée moyenne des sessions
router.get("/average-duration", catchAsync((req: Request, res: Response) => sessionController.getAverageSessionDuration(req, res)));

// ➕ Créer plusieurs sessions pour un salon
router.post("/batch", catchAsync((req: Request, res: Response) => sessionController.createMultipleSessions(req, res)));

// ➕ Créer une session pour un salon donné par son nom
router.post("/:salonNom", catchAsync((req: Request, res: Response) => sessionController.createSession(req, res)));

// ➕ Créer plusieurs sessions pour un salon donné par son ID
router.post("/salons/:salonId/multiple", catchAsync((req: Request, res: Response) => sessionController.createMultipleSessions(req, res)));

// ➕ Créer une session dans un salon donné par son ID
router.post("/salons/:salonId/sessions", catchAsync((req: Request, res: Response) => sessionController.createSessionForSalon(req, res)));

// Nouvelles routes pour filtrer par compétence
router.get("/skill/:skillId", catchAsync(async (req: Request, res: Response) => sessionController.getSessionsBySkill(req, res)));
router.get("/salon/:salonId/skill/:skillId", catchAsync(async (req: Request, res: Response) => sessionController.getSessionsBySalonAndSkill(req, res)));
// GET /api/sessions/by-salon-name/:name

// GET /sessions/by-salon/:salonNom
router.get('/by-salon/:salonNom', sessionController.getSessionsBySalonNom);

export default router;
