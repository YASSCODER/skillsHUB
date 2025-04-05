import { Request, Response } from "express";
import RewardsService from "./reward.service";

class RewardsController {
  static async getUserRewards(req: Request, res: Response) {
    try {
      const rewards = await RewardsService.getUserRewards(req.params.userId);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rewards" });
    }
  }

  static async earnPoints(req: Request, res: Response) {
    try {
      const updatedRewards = await RewardsService.earnPoints(req.params.userId, req.body.points);
      res.json(updatedRewards);
    } catch (error) {
      res.status(500).json({ error: "Failed to update rewards" });
    }
  }

  static async redeemPoints(req: Request, res: Response) {
    try {
      const result = await RewardsService.redeemPoints(req.params.userId, req.body.points);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to redeem points" });
    }
  }
}

export default RewardsController;
