import { Router } from "express";
import { BadgeController } from "./badge.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();
const badgeController = new BadgeController();

router.post("/", (req, res, next) => badgeController.awardBadge(req, res).catch(next));
router.get("/", (req, res, next) => badgeController.getAllBadges(req, res).catch(next));
router.put("/:id", catchAsync(badgeController.updateBadge));
router.delete("/:id",catchAsync (badgeController.deleteBadge));
router.get("/leaderboard", catchAsync(badgeController.getLeaderboard));
router.get("/user/:userId", catchAsync(badgeController.getUserBadges));


export default router;