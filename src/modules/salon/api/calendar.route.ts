import { Router, Request, Response } from "express";
import { CalendarController } from "./calendar.controller";
import catchAsync from "../../../common/utils/catch-async.utils";
import { authMiddleware } from "../../../common/middleware/auth.middleware";

const router = Router();
const calendarController = new CalendarController();

// Route publique pour tester sans authentification
router.get("/public/salon/:salonId", catchAsync(async (req: Request, res: Response) => calendarController.getSalonEvents(req, res)));

// Routes protégées par authentification
// Comment this line during testing if needed
router.use('/', authMiddleware);

// Routes pour les événements d'un salon
router.get("/salon/:salonId", catchAsync(async (req: Request, res: Response) => calendarController.getSalonEvents(req, res)));

// Routes pour les événements d'un utilisateur
router.get("/user/:userId", catchAsync(async (req: Request, res: Response) => calendarController.getUserEvents(req, res)));

// Routes pour la gestion des événements
router.post("/", catchAsync(async (req: Request, res: Response) => calendarController.createEvent(req, res)));
router.put("/:eventId", catchAsync(async (req: Request, res: Response) => calendarController.updateEvent(req, res)));
router.delete("/:eventId", catchAsync(async (req: Request, res: Response) => calendarController.deleteEvent(req, res)));

// Route pour vérifier la disponibilité d'un utilisateur
router.get("/availability/:userId", catchAsync(async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({ error: "Les paramètres start et end sont requis" });
    }
    
    const isAvailable = await calendarController.checkAvailability(
      userId,
      new Date(start as string),
      new Date(end as string)
    );
    
    return res.status(200).json({ available: isAvailable });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}));

// Route pour suggérer des créneaux disponibles
router.post("/suggest-slots", catchAsync(async (req: Request, res: Response) => {
  try {
    const { userIds, duration, startDate, endDate } = req.body;
    
    if (!userIds || !duration || !startDate || !endDate) {
      return res.status(400).json({ error: "Tous les paramètres sont requis" });
    }
    
    const availableSlots = await calendarController.suggestAvailableSlots(
      userIds,
      duration,
      new Date(startDate),
      new Date(endDate)
    );
    
    return res.status(200).json(availableSlots);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}));

export default router;
