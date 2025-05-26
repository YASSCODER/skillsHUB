import axios from "axios";
import { IChallenge } from "../../../common/models/interface/challenge.interface";
import ChallengeModel from "../../../common/models/types/challenge.schema";
import badgeSchema from "../../../common/models/types/badge.schema";
import { isValidObjectId, Types } from "mongoose";

export class ChallengeService {
  async create(challengeData: Partial<IChallenge>): Promise<IChallenge> {
    if (!challengeData.createdBy) {
      throw new Error("Le champ createdBy est requis");
    }
    const challenge = new ChallengeModel(challengeData);
    return await challenge.save();
  }

  async findAll(): Promise<IChallenge[]> {
    return await ChallengeModel.find().populate("createdBy", "fullName email");
  }

  async findById(id: string): Promise<IChallenge | null> {
    return await ChallengeModel.findById(id);
  }

  async update(
    id: string,
    updatedChallenge: Partial<IChallenge>
  ): Promise<IChallenge | null> {
    return await ChallengeModel.findByIdAndUpdate(id, updatedChallenge, {
      new: true,
    });
  }

  async delete(id: string): Promise<boolean> {
    // Supprimer les badges associés à ce challenge
    await badgeSchema.deleteMany({ challengeId: id });
  
    // Supprimer le challenge lui-même
    const result = await ChallengeModel.findByIdAndDelete(id);
    return result !== null;
  }

  // Lister les challenges disponibles à venir (basé sur une date de début)
  async getUpcomingChallenges() {
    return await ChallengeModel.find({ startDate: { $gte: new Date() } }).sort({ startDate: 1 });
  }

  //Valider automatiquement un challenge réussi
  async validateChallengeCompletion(userId: string, challengeId: string, score: number) {
    const challenge = await ChallengeModel.findById(challengeId);
    if (!challenge) throw new Error("Challenge introuvable");
  
    const status = score >= 100 ? "réussi" : "échoué";
  
    // Tu peux enregistrer l'état dans un autre modèle ou journal
    return { challengeId, userId, score, status };
  }

   // 🔥 Nouvelle méthode pour appeler Open Trivia DB
   async fetchTriviaQuestions(
    amount = 5,
    category = 18,
    difficulty = "medium",
    type = "multiple"
  ) {
    const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=${type}`;
  
    try {
      const response = await axios.get(url, { timeout: 5000 });
      return response.data.results;
    } catch (error) {
      console.error('Impossible de récupérer les questions, utilisation de données simulées.');
      return [
        {
          question: 'Quelle est la capitale de la France ?',
          correct_answer: 'Paris',
          incorrect_answers: ['Berlin', 'Madrid', 'Rome'],
        },
      ];
    }
  }

  // ChallengeService.ts
  async saveUserScore(userId: string, challengeId: string, score: number) {
    if (!isValidObjectId(userId)) {
      throw new Error("userId invalide");
    }
    if (!isValidObjectId(challengeId)) {
      throw new Error("challengeId invalide");
    }
  
    const challenge = await ChallengeModel.findById(challengeId);
    if (!challenge) throw new Error("Challenge non trouvé");
  
    const userObjectId = new Types.ObjectId(userId);
  
    challenge.scores = challenge.scores || [];
    challenge.scores.push({ userId: userObjectId, score, date: new Date() });
  
    await challenge.save();
  
    return { message: "Score enregistré avec succès", challengeId, userId, score };
  }
  
}
