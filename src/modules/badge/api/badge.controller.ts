import { Request, Response } from "express";
import { BadgeService } from "./badge.service";

const badgeService = new BadgeService();

export class BadgeController {
  async awardBadge(req: Request, res: Response) {
    try {
      const { userId, challengeId, score } = req.body;
      const badge = await badgeService.awardBadge(userId, challengeId, score);
      res.status(201).json(badge);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Erreur inconnue lors de l’attribution du badge" });
      }
    }
  }
  

  async getUserBadges(req: Request, res: Response) {
    try {
      const badges = await badgeService.findBadgesByUser(req.params.userId);
      res.status(200).json(badges);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des badges" });
    }
  }

  async getLeaderboard(req: Request, res: Response) {
    try {
      const leaderboard = await badgeService.getLeaderboard();
      res.status(200).json(leaderboard);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération du classement" });
    }
  }
}
