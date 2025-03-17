import { Router } from "express";
import { FeedbackController } from "./feedback.controller";
import catchAsync from "../../common/utils/catch-async.utils";

const router = Router();
const feedbackController = new FeedbackController();

router.post("/", catchAsync(feedbackController.createFeedback));
router.get("/", catchAsync(feedbackController.getAllFeedbacks));
router.get("/:id", catchAsync(feedbackController.getFeedbackById));
router.put("/:id", catchAsync(feedbackController.updateFeedback));
router.delete("/:id", catchAsync(feedbackController.deleteFeedback));

export default router;
