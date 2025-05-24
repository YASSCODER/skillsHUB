import { Router, Request, Response } from "express";
import { SalonController } from "./salon.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();
const salonController = new SalonController();

// Routes existantes
router.get("/", catchAsync(async (req: Request, res: Response) => salonController.getAllSalons(req, res)));
router.post("/", catchAsync(async (req: Request, res: Response) => salonController.createSalon(req, res)));
router.get("/:id", catchAsync(async (req: Request, res: Response) => salonController.getSalonById(req, res)));

// Nouvelles routes pour filtrer par compétence
router.get("/skill/:skillId", catchAsync(async (req: Request, res: Response) => salonController.getSalonsBySkill(req, res)));
router.get("/with-sessions/skill/:skillId", catchAsync(async (req: Request, res: Response) => salonController.getSalonsWithSessionsBySkill(req, res)));

export default router;
