import { Router } from "express";
import challengeRoutes from "./api/challenge.routes";

const ChallengeModule: { path: string; handler: Router } = {
  path: "/challenges",
  handler: challengeRoutes,
};

export default ChallengeModule;
