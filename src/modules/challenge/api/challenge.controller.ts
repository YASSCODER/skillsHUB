import { Request, Response } from "express";
import { ChallengeService } from "./challenge.service";
import axios from "axios";
import Challenge from "../../../common/models/types/challenge.schema";

const challengeService = new ChallengeService();

export class ChallengeController {

    // ======================= 👨‍💼 ADMIN =======================

    async createChallengeFromTrivia(req: Request, res: Response) {
      try {
        const { amount, category, difficulty, title, description, createdBy, skill, startDate } = req.body;
    
        const triviaURL = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`;
    
        const response = await axios.get(triviaURL);
    
        if (response.data.response_code !== 0) {
          return res.status(400).json({ message: "Impossible de récupérer les questions depuis Trivia." });
        }
    
        const triviaQuestions = response.data.results;
    
        const challenge = new Challenge({
          title,
          description,
          skill,
          difficulty,
          startDate,
          createdBy,
          questions: triviaQuestions
        });
    
        await challenge.save();
    
        res.status(201).json({ message: "Challenge créé depuis Trivia avec succès", challenge });
      } catch (error) {
        console.error("Erreur lors de la création du challenge depuis Trivia :", error);
        res.status(500).json({ message: "Erreur serveur" });
      }
    };

  async createChallenge(req: Request, res: Response) {
    try {
      // S'assurer que le frontend envoie 'createdBy' ou qu'il est extrait d'un token auth
      const createdBy = req.body.createdBy; // Tu peux extraire cette info de l'utilisateur connecté si tu as un middleware d'authentification.
  
      if (!createdBy) {
        return res.status(400).json({ error: "Le champ 'createdBy' est requis" });
      }
  
      // Créer le challenge en ajoutant 'createdBy' à partir du corps de la requête
      const challenge = await challengeService.create({
        ...req.body,
        createdBy: createdBy,
      });
  
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

    // ======================= 🙋‍♂️ UTILISATEUR =======================

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
    console.log("req.query reçu :", req.query);
    const { amount, category, difficulty, type } = req.query;
    console.log('Paramètres reçus dans le backend :', { amount, category, difficulty, type });

    const questions = await challengeService.fetchTriviaQuestions(
      Number(amount) || 5,
      Number(category) || 18,
      (difficulty as string) || "medium",
      (type as string) || "multiple"
    );

    console.log('Questions récupérées depuis l\'API Trivia :', questions);

    res.status(200).json(questions);
  } catch (error) {
    console.error("Erreur Trivia API:", (error as Error).message);
    if (axios.isAxiosError(error)) {
      console.error("Détails Axios:", error.response?.data);
    }
    res.status(500).json({ message: 'Erreur Trivia API', detail: (error as Error).message });
  }
}


// ChallengeController.ts
async saveScore(req: Request, res: Response) {
  try {
    console.log("Reçu dans saveScore:", req.body); // 🔍 Debug ici
    const { userId, challengeId, score } = req.body;

    if (!userId || !challengeId || score === undefined) {
      return res.status(400).json({ message: "Champs requis manquants (userId, challengeId, score)" });
    }

    const saved = await challengeService.saveUserScore(userId, challengeId, score);
    res.status(200).json(saved);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du score :", error);
    res.status(500).json({ message: "Erreur lors de l'enregistrement du score" });
  }
}

async getScoresByUserAndChallenge(req: Request, res: Response) {
  try {
    const { userId, id: challengeId } = req.params;

    const challenge = await challengeService.findById(challengeId);
    if (!challenge) return res.status(404).json({ message: "Challenge non trouvé" });

    const participant = challenge.scores.find((p: any) => p.user.toString() === userId);
    if (!participant) return res.status(404).json({ message: "Aucun score trouvé pour cet utilisateur" });

    res.status(200).json({ score: participant.score, completedAt: participant.date });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
}


// passer le quiz
async getChallengeQuestions(req: Request, res: Response) {
  try {
    const challenge = await Challenge.findById(req.params.id).select("questions");
    if (!challenge) {
      return res.status(404).json({ message: "Challenge introuvable" });
    }
    res.status(200).json((challenge as any).questions || []);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
}

async submitChallengeAnswers(req: Request, res: Response) {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge introuvable" });
    }

    const { userId, answers } = req.body;
    let score = 0;

    (challenge as any).questions?.forEach((q: any) => {
      const userAnswer = answers.find((a: any) => a.question === q.question);
      if (userAnswer && userAnswer.answer === q.correct_answer) {
        score++;
      }
    });

    challenge.scores.push({ userId: userId, score, date: new Date() });
    await challenge.save();

    res.status(200).json({ message: "Réponses soumises", score });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
}

}


