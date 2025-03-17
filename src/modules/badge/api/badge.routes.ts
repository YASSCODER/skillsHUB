import { Router } from "express";
import { BadgeController } from "./badge.controller";

const router = Router();
const badgeController = new BadgeController();

router.post("/", (req, res, next) => badgeController.awardBadge(req, res).catch(next));
router.get("/:userId", (req, res, next) => badgeController.getUserBadges(req, res).catch(next));
router.get("/leaderboard", (req, res, next) => badgeController.getLeaderboard(req, res).catch(next));

export default router;
