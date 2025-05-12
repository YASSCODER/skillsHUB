import { Router } from "express";
import { SalonController } from "./salon.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();
const salonController = new SalonController();

// ✅ Route pour getById
router.post("/", catchAsync((req, res) => salonController.createSalon(req, res)));
router.get("/", catchAsync((req, res) => salonController.getAllSalons(req, res)));
router.get("/:id", catchAsync((req, res) => salonController.getSalonById(req, res)));
router.get("/nom/:name", catchAsync((req, res) => salonController.getSalonByName(req, res)));
router.put("/nom/:name", catchAsync((req, res) => salonController.updateSalonByName(req, res)));router.get("/exists/:name", catchAsync((req, res) => salonController.existsSalonByName(req, res)));
router.get("/count/user/:userId", catchAsync((req, res) => salonController.countSalonsByUser(req, res)));
router.get("/leaderboard", catchAsync((req, res) => salonController.getUserLeaderboard(req, res)));
router.delete("/nom/:name", catchAsync((req, res) => salonController.deleteSalon(req, res)));
// Route pour afficher les salons avec leurs sessions associées
router.get(
  "/salons-with-sessions",
  catchAsync((req, res) => salonController.getSalonsWithSessions(req, res))
);

export default router;
