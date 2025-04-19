import { Router } from "express";
import CommentRoutes from "./api/comment.routes"

const CommentModule: { path: string; handler: Router } = {
  path: "/comments",
  handler: CommentRoutes,
};

export default CommentModule;
