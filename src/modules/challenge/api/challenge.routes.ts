import { Router } from "express";
import { ChallengeController } from "./challenge.controller";
import catchAsync from "../../../common/utils/catch-async.utils";
import { RoleEnum } from "../../../common/enum/role.enum";
import { authenticateJWT } from "../../../common/middleware/auth.middelware";
import { Role } from "../../../common/middleware/role-guard.middleware";

const router = Router();
const challengeController = new ChallengeController();

router.post(
  "/add",
  Role([RoleEnum.ADMIN]),
  catchAsync(challengeController.createChallenge)
);
router.get("/show", catchAsync(challengeController.getAllChallenges));
router.get("/upcoming", catchAsync(challengeController.getUpcomingChallenges));
router.get("/:id", catchAsync(challengeController.getChallengeById));
router.put("/:id", catchAsync(challengeController.updateChallenge));
router.delete("/:id", catchAsync(challengeController.deleteChallenge));

router.post("/validate", (req, res, next) =>
  challengeController.validateChallengeCompletion(req, res).catch(next)
);

router.get(
  "/trivia/questions",
  catchAsync(challengeController.getTriviaQuestions)
);

export default router;
