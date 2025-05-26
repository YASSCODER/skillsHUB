import { Request, Response } from "express";
import { BadgeService } from "./badge.service";
import { sendCertificateEmail } from "../../../common/utils/mailService";
import userSchema from "../../../common/models/types/user.schema";

const badgeService = new BadgeService();

export class BadgeController {
  async awardBadge(req: Request, res: Response) {
    try {
      const { userId, challengeId, score } = req.body;
      const badge = await badgeService.awardBadge(userId, challengeId, score);


      // Vérifier si le badge existe et si le totalPercentage atteint 1000%
      if (badge && badge.totalPercentage >= 1000) {
        console.log(`🎉 L'utilisateur ${userId} a obtenu un certificat !`);

        // Générer l'URL de l'image du certificat
        const certificateImageUrl = `https://ui-avatars.com/api/?name=Certificat&background=ffcc00&color=000&bold=true&format=png`;

        // Mettre à jour le badge avec l'URL du certificat
        badge.certificateImageUrl = certificateImageUrl;
        await badge.save();

        // Récupérer l'email et prénom de l'utilisateur
        const user = await userSchema.findById(userId);
        if (user && user.email) {
          await sendCertificateEmail(user.email, user.fullName || 'Utilisateur');
        }
      }

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
      const userId = req.params.userId;
  
      if (!userId) {
        return res.status(400).json({ error: 'ID utilisateur manquant.' }); // Erreur explicite
      }
  
      const badges = await badgeService.findBadgesByUser(userId);
      res.status(200).json(badges);
    } catch (error) {
      console.error('Erreur lors de la récupération des badges :', error);
      res.status(500).json({ error: 'Erreur interne lors de la récupération des badges.' });
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