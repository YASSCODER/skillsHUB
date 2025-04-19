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
}

export default RewardsController;
