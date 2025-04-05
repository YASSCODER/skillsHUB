import { Router } from "express";
import RewardsController from "./reward.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();

router.get("/:userId", catchAsync(RewardsController.getUserRewards));
router.post("/:userId/earn", catchAsync(RewardsController.earnPoints));
router.post("/:userId/redeem", catchAsync(RewardsController.redeemPoints));

export default router;
