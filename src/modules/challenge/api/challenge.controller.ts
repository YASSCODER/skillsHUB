import { Request, Response } from "express";
import { ChallengeService } from "./challenge.service";

const challengeService = new ChallengeService();

export class ChallengeController {
  // ✅ Créer un challenge
  async createChallenge(req: Request, res: Response) {
    try {
      const challenge = await challengeService.create(req.body);
      res.status(201).json({ message: "Challenge créé avec succès", challenge });
    } catch (error) {
      console.error("Erreur lors de la création du challenge :", error);
      res.status(500).json({ error: "Impossible de créer le challenge." });
    }
  }

  // ✅ Récupérer tous les challenges
  async getAllChallenges(req: Request, res: Response) {
    try {
      const challenges = await challengeService.findAll();
      res.status(200).json(challenges);
    } catch (error) {
      console.error("Erreur lors de la récupération des challenges :", error);
      res.status(500).json({ error: "Impossible de récupérer les challenges." });
    }
  }

  // ✅ Récupérer un challenge par ID
  async getChallengeById(req: Request, res: Response) {
    try {
      const challenge = await challengeService.findById(req.params.id);
      if (!challenge) {
        return res.status(404).json({ error: "Challenge introuvable" });
      }
      res.status(200).json(challenge);
    } catch (error) {
      console.error("Erreur lors de la récupération du challenge :", error);
      res.status(500).json({ error: "Impossible de récupérer le challenge." });
    }
  }

  // ✅ Mettre à jour un challenge
  async updateChallenge(req: Request, res: Response) {
    try {
      const updatedChallenge = await challengeService.update(req.params.id, req.body);
      if (!updatedChallenge) {
        return res.status(404).json({ error: "Challenge introuvable" });
      }
      res.status(200).json({ message: "Challenge mis à jour avec succès", updatedChallenge });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du challenge :", error);
      res.status(500).json({ error: "Impossible de mettre à jour le challenge." });
    }
  }

  // ✅ Supprimer un challenge
  async deleteChallenge(req: Request, res: Response) {
    try {
      const isDeleted = await challengeService.delete(req.params.id);
      if (!isDeleted) {
        return res.status(404).json({ error: "Challenge introuvable" });
      }
      res.status(200).json({ message: "Challenge supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression du challenge :", error);
      res.status(500).json({ error: "Impossible de supprimer le challenge." });
    }
  }
}
