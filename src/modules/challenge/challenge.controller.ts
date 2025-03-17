import { Request, Response } from "express";
import { ChallengeService } from "./challenge.service";

const challengeService = new ChallengeService();

export class ChallengeController {
  async createChallenge(req: Request, res: Response) {
    try {
      const challenge = await challengeService.create(req.body);
      res.status(201).json(challenge);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la création du challenge" });
    }
  }

  async getAllChallenges(req: Request, res: Response) {
    try {
      const challenges = await challengeService.findAll();
      res.status(200).json(challenges);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des challenges" });
    }
  }

  async getChallengeById(req: Request, res: Response) {
    try {
      const challenge = await challengeService.findById(req.params.id);
      if (!challenge) return res.status(404).json({ message: "Challenge non trouvé" });
      res.status(200).json(challenge);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération du challenge" });
    }
  }

  async updateChallenge(req: Request, res: Response) {
    try {
      const challenge = await challengeService.update(req.params.id, req.body);
      if (!challenge) return res.status(404).json({ message: "Challenge non trouvé" });
      res.status(200).json(challenge);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour du challenge" });
    }
  }

  async deleteChallenge(req: Request, res: Response) {
    try {
      const deleted = await challengeService.delete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Challenge non trouvé" });
      res.status(200).json({ message: "Challenge supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression du challenge" });
    }
  }
}
