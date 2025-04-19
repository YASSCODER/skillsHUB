import { Router } from "express";
import communityRoutes from "./api/community.routes";

const CommunityModule: { path: string; handler: Router } = {
  path: "/communities",
  handler: communityRoutes,
};

export default CommunityModule;
