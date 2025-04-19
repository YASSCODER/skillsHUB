import { Router } from "express";
import { SalonController } from "./salon.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();
const salonController = new SalonController();

// Routes CRUD de base
router.post("/", catchAsync((req, res) => salonController.createSalon(req, res)));
router.get("/", catchAsync((req, res) => salonController.getAllSalons(req, res)));
router.get("/user/:userId", catchAsync((req, res) => salonController.getSalonsByUser(req, res)));
router.put("/:id", catchAsync((req, res) => salonController.updateSalon(req, res)));
router.delete("/:id", catchAsync((req, res) => salonController.deleteSalon(req, res)));

// Routes métiers avancées
router.get("/with-sessions", catchAsync((req, res) => salonController.getSalonsWithSessions(req, res)));
router.get("/exists/:name", catchAsync((req, res) => salonController.existsSalonByName(req, res)));
router.get("/count/user/:userId", catchAsync((req, res) => salonController.countSalonsByUser(req, res)));
router.get("/leaderboard", catchAsync((req, res) => salonController.getUserLeaderboard(req, res)));

export default router;
