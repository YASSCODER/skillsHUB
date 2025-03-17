import { Router } from "express";
import { ChallengeController } from "./challenge.controller";

const router = Router();
const challengeController = new ChallengeController();

/*router.post("/", (req, res, next) => challengeController.createChallenge(req, res).catch(next));
router.get("/", (req, res, next) => challengeController.getAllChallenges(req, res).catch(next));
router.get("/:id", (req, res, next) => challengeController.getChallengeById(req, res).catch(next));
router.put("/:id", (req, res, next) => challengeController.updateChallenge(req, res).catch(next));
router.delete("/:id", (req, res, next) => challengeController.deleteChallenge(req, res).catch(next));

export default router;*/
