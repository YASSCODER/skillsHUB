import { Router } from "express";
import feedbackRoutes from "./api/feedback.routes";

const FeedbackModule: { path: string; handler: Router } = {
  path: "/feedbacks",
  handler: feedbackRoutes,
};

export default FeedbackModule;
