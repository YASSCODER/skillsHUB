import { Router } from "express";
import RewardRoutes from "./api/reward.routes";

const RewardModule: { path: string; handler: Router } = {
  path: "/rewards",
  handler: RewardRoutes,
};

export default RewardModule;
