import { Router } from "express";
import forumRoutes from "./api/forum.routes";

const ForumModel : { path: string; handler: Router } = {
  path: "/forum",
  handler: forumRoutes,
};

export default ForumModel;
