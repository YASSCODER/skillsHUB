import { Request, Response } from "express";
import RewardsService from "./reward.service";

class RewardsController {
  static async getUserRewards(req: Request, res: Response) {
    try {
      const rewards = await RewardsService.getUserRewards(req.params.userId);
      res.json(rewards);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch rewards" });
    }
  }

  static async getUserHistory(req: Request, res: Response) {
    try {
      const history = await RewardsService.getUserHistory(req.params.userId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch history" });
    }
  }

  static async earnPoints(req: Request, res: Response) {
    try {
      const { points, walletId, source } = req.body;
      const result = await RewardsService.earnPoints(req.params.userId, points, walletId, source);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to update rewards" });
    }
  }

  static async redeemPoints(req: Request, res: Response) {
    try {
      const { points, walletId, source } = req.body;
      const result = await RewardsService.redeemPoints(req.params.userId, points, walletId, source);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to redeem points" });
    }
  }

  // Convert points to iMoney
  static async convertPointsToImoney(req: Request, res: Response) {
    try {
      const { points, walletId } = req.body;
      const { userId } = req.params;

      console.log("convertPointsToImoney - Request:", { userId, points, walletId });

      if (!points || !walletId) {
        return res.status(400).json({ error: "Points and walletId are required" });
      }

      // Convert points to iMoney (this only deducts points)
      const conversionResult = await RewardsService.convertPointsToImoney(userId, points, walletId);

      console.log("convertPointsToImoney - Conversion successful:", conversionResult);

      res.status(200).json({
        message: "Points converted successfully",
        ...conversionResult
      });
    } catch (error: any) {
      console.error("convertPointsToImoney - Error:", error.message);
      res.status(400).json({ error: error.message || "Failed to convert points" });
    }
  }

  // Get conversion information
  static async getConversionInfo(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const info = await RewardsService.getConversionInfo(userId);
      res.json(info);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get conversion info" });
    }
  }

  // Get user rewards with conversion info
  static async getUserRewardsWithConversion(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const [rewards, conversionInfo] = await Promise.all([
        RewardsService.getUserRewards(userId),
        RewardsService.getConversionInfo(userId)
      ]);

      res.json({
        rewards,
        conversion: conversionInfo
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch rewards" });
    }
  }
}

export default RewardsController;
