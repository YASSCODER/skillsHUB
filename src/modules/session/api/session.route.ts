import { Router } from "express";
import { SessionController } from "./session.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();
const sessionController = new SessionController();

// ➕ Créer une session
router.get('/search', catchAsync((req, res) => sessionController.searchSessions(req, res)));

router.post("/", catchAsync((req, res) => sessionController.createSession(req, res)));
// 📋 Récupérer toutes les sessions
router.get("/", catchAsync((req, res) => sessionController.getAllSessions(req, res)));

// 🔍 Récupérer une session par ID
router.get("/:id", catchAsync((req, res) => sessionController.getSessionById(req, res)));

// 🔄 Mettre à jour une session par ID
router.put("/:id", catchAsync((req, res) => sessionController.updateSession(req, res)));

// 🗑️ Supprimer une session par ID
router.delete("/:id", catchAsync((req, res) => sessionController.deleteSession(req, res)));

// 🔍 Récupérer les sessions par utilisateur
router.get("/user/:userId", catchAsync((req, res) => sessionController.getSessionsByUser(req, res)));

// 🔢 Compter les sessions par salon
router.get("/count/by-salon/:salonId", catchAsync((req, res) => sessionController.countSessionsBySalon(req, res)));

// 🔍 Récupérer les sessions par type (chat ou meet)
router.get("/type/:type", catchAsync((req, res) => sessionController.getSessionsByType(req, res)));

// ⏱️ Récupérer la durée moyenne des sessions
router.get("/average-duration", catchAsync((req, res) => sessionController.getAverageSessionDuration(req, res)));

// ➕ Créer plusieurs sessions pour un salon
router.post("/batch", catchAsync((req, res) => sessionController.createMultipleSessions(req, res)));

// ➕ Créer une session pour un salon donné par son nom
router.post("/:salonNom", catchAsync((req, res) => sessionController.createSession(req, res)));

// ➕ Créer plusieurs sessions pour un salon donné par son ID
router.post("/salons/:salonId/multiple", catchAsync((req, res) => sessionController.createMultipleSessions(req, res)));

// ➕ Créer une session dans un salon donné par son ID
router.post("/salons/:salonId/sessions", catchAsync((req, res) => sessionController.createSessionForSalon(req, res)));

// Nouvelles routes pour filtrer par compétence
router.get("/skill/:skillId", catchAsync(async (req, res) => sessionController.getSessionsBySkill(req, res)));
router.get("/salon/:salonId/skill/:skillId", catchAsync(async (req, res) => sessionController.getSessionsBySalonAndSkill(req, res)));

export default router;
