import { Router, Request, Response } from "express";
import { SalonController } from "./salon.controller";
import catchAsync from "../../../common/utils/catch-async.utils";
import nodemailer from 'nodemailer';
import Salon from '../../../common/models/salon.schema';
import { inviterUtilisateur } from './mail.controller';

const router = Router();
const salonController = new SalonController();

// IMPORTANT: Placer les routes spécifiques AVANT les routes avec paramètres dynamiques
router.get("/search", catchAsync(async (req: Request, res: Response) => salonController.searchSalons(req, res)));

router.get("/", catchAsync(async (req: Request, res: Response) => salonController.getAllSalons(req, res)));
router.post("/", catchAsync(async (req: Request, res: Response) => salonController.createSalon(req, res)));

router.get("/skill/:skillId", catchAsync(async (req: Request, res: Response) => salonController.getSalonsBySkill(req, res)));
router.get("/with-sessions/skill/:skillId", catchAsync(async (req: Request, res: Response) => salonController.getSalonsWithSessionsBySkill(req, res)));

router.get("/nom/:name", catchAsync(async (req: Request, res: Response) => salonController.getSalonByName(req, res)));
router.put("/nom/:name", catchAsync(async (req: Request, res: Response) => salonController.updateSalonByName(req, res)));
router.delete("/nom/:name", catchAsync(async (req: Request, res: Response) => salonController.deleteSalon(req, res)));

// ✅ ROUTE POUR ENVOYER UNE INVITATION PAR EMAIL
router.post('/inviter', catchAsync(inviterUtilisateur));

// Route dynamique avec ID (à mettre en dernier)
router.get("/:id", catchAsync(async (req: Request, res: Response) => salonController.getSalonById(req, res)));

export default router;
