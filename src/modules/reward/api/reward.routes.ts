import { Router } from "express";
import RewardsController from "./reward.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();

router.get("/:userId", catchAsync(RewardsController.getUserRewards));
router.get("/:userId/with-conversion", catchAsync(RewardsController.getUserRewardsWithConversion));
router.get("/:userId/history", catchAsync(RewardsController.getUserHistory));
router.get("/:userId/conversion-info", catchAsync(RewardsController.getConversionInfo));
router.post("/:userId/earn", catchAsync(RewardsController.earnPoints));
router.post("/:userId/redeem", catchAsync(RewardsController.redeemPoints));
router.post("/:userId/convert-to-imoney", catchAsync(RewardsController.convertPointsToImoney));

export default router;
