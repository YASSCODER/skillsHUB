import { Router } from "express";
import { FeedbackController } from "./feedback.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();
const feedbackController = new FeedbackController();

router.post("/", catchAsync(feedbackController.createFeedback));
router.get("/", catchAsync(feedbackController.getAllFeedbacks));
router.put("/:id", catchAsync(feedbackController.updateFeedback));
router.delete("/:id", catchAsync(feedbackController.deleteFeedback));

router.get("/user/:userId/average", catchAsync(feedbackController.getAverageRating));
router.get("/top-rated", catchAsync(feedbackController.getTopRatedUsers));
router.get("/:id", catchAsync(feedbackController.getFeedbackById));

// ✅ Nouvelle route pour récupérer le nom de l'utilisateur à partir de son ID
router.get("/user/:id/username", catchAsync(feedbackController.getUsernamebyid));


export default router;