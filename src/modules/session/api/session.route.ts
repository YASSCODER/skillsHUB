import { Router } from "express";
import { SessionController } from "./session.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();
const sessionController = new SessionController();

router.post("/", catchAsync((req, res) => sessionController.createSession(req, res)));
router.get("/user/:userId", catchAsync((req, res) => sessionController.getSessionsByUser(req, res)));
router.get("/", catchAsync((req, res) => sessionController.getAllSessions(req, res)));
router.put("/:id", catchAsync((req, res) => sessionController.updateSession(req, res)));
router.delete("/:id", catchAsync((req, res) => sessionController.deleteSession(req, res)));
router.get("/count/by-salon/:salonId", catchAsync((req, res) => sessionController.countSessionsBySalon(req, res)));
router.get("/type/:type", catchAsync((req, res) => sessionController.getSessionsByType(req, res)));
router.get("/average-duration", catchAsync((req, res) => sessionController.getAverageSessionDuration(req, res)));

export default router;
