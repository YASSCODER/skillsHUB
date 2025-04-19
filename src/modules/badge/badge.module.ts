import { Router } from "express";
import badgeRoutes from "./api/badge.routes";

const BadgeModule: { path: string; handler: Router } = {
  path: "/badges",
  handler: badgeRoutes,
};

export default BadgeModule;
