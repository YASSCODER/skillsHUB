import { Request, Response } from "express";
import { BadgeService } from "./badge.service";
import { BadgeEnum } from "../../../common/enum/badge.enum";

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

  async getAllBadges(req: Request, res: Response) {
    try {
      const badges = await badgeService.findAll();
      res.status(200).json(badges);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des badges" });
    }
  }

  async updateBadge(req: Request, res: Response) {
    try {
      const badgeId = req.params.id;
      const updateData = req.body;
  
      const updatedBadge = await badgeService.updateBadge(badgeId, updateData);
  
      if (!updatedBadge) {
        return res.status(404).json({ message: "Badge non trouvé" });
      }
  
      res.status(200).json(updatedBadge);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour du badge" });
    }
  }
  
  async deleteBadge(req: Request, res: Response) {
    try {
      const deleted = await badgeService.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Badge non trouvé" });
      }
      res.status(200).json({ message: "Badge supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression du badge" });
    }
  }
}