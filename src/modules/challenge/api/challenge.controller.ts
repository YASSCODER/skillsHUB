import { Request, Response } from "express";
import { ChallengeService } from "./challenge.service";

const challengeService = new ChallengeService();

export class ChallengeController {
  async createChallenge(req: Request, res: Response) {
    try {
      const challenge = await challengeService.create(req.body);
      res.status(201).json(challenge);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la création du challenge" });
    }
  }

  async getAllChallenges(req: Request, res: Response) {
    try {
      const challenges = await challengeService.findAll();
      res.status(200).json(challenges);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des challenges" });
    }
  }

  async getChallengeById(req: Request, res: Response) {
    try {
      const challenge = await challengeService.findById(req.params.id);
      if (!challenge)
        return res.status(404).json({ message: "Challenge non trouvé" });
      res.status(200).json(challenge);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération du challenge" });
    }
  }

  async updateChallenge(req: Request, res: Response) {
    try {
      const challenge = await challengeService.update(req.params.id, req.body);
      if (!challenge)
        return res.status(404).json({ message: "Challenge non trouvé" });
      res.status(200).json(challenge);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la mise à jour du challenge" });
    }
  }

  async deleteChallenge(req: Request, res: Response) {
    try {
      const deleted = await challengeService.delete(req.params.id);
      if (!deleted)
        return res.status(404).json({ message: "Challenge non trouvé" });
      res.status(200).json({ message: "Challenge supprimé avec succès" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la suppression du challenge" });
    }
  }

//Récupérer les challenges à venir

  async getUpcomingChallenges(req: Request, res: Response) {
  try {
    const upcoming = await challengeService.getUpcomingChallenges();
    res.status(200).json(upcoming);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des challenges à venir" });
  }
}

//Valider si un utilisateur a complété un challenge en fonction de son score.

async validateChallengeCompletion(req: Request, res: Response) {
  try {
    const { userId, challengeId, score } = req.body;
    const result = await challengeService.validateChallengeCompletion(userId, challengeId, score);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la validation du challenge" });
  }
}

//  Nouvelle méthode : Récupérer des questions depuis Open Trivia DB
async getTriviaQuestions(req: Request, res: Response) {
  try {
    const { amount, category, difficulty, type } = req.query;
    const questions = await challengeService.fetchTriviaQuestions(
      Number(amount) || 5,
      Number(category) || 18,
      (difficulty as string) || "medium",
      (type as string) || "multiple"
    );
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des questions", error });
  }
}

}