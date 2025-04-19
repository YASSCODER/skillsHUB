import { Router } from "express";
import { ChallengeController } from "./challenge.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();
const challengeController = new ChallengeController();

router.post("/add",  catchAsync(challengeController.createChallenge));
router.get("/show", catchAsync(challengeController.getAllChallenges));
router.get("/upcoming", catchAsync(challengeController.getUpcomingChallenges));
router.get("/:id",catchAsync(challengeController.getChallengeById));
router.put("/:id", catchAsync(challengeController.updateChallenge));
router.delete("/:id", catchAsync(challengeController.deleteChallenge));
  
  router.post("/validate", (req, res, next) =>
    challengeController.validateChallengeCompletion(req, res).catch(next)
  );


  // ✅ Nouvelle route pour récupérer des questions trivia
router.get("/trivia/questions", catchAsync(challengeController.getTriviaQuestions));

export default router;