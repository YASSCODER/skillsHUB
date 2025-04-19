import axios from "axios";
import { IChallenge } from "../../../common/models/interface/challenge.interface";
import ChallengeModel from "../../../common/models/types/challenge.schema";
import challenge from "../../../common/models/types/challenge.schema";

export class ChallengeService {
  async create(challengeData: Partial<IChallenge>): Promise<IChallenge> {
    const challenge = new ChallengeModel(challengeData);
    return await challenge.save();
  }

  async findAll(): Promise<IChallenge[]> {
    return await ChallengeModel.find();
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
  
    const status = score >= 12 ? "réussi" : "échoué";
  
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
    const response = await axios.get(url);
    return response.data.results;
  }
  
}
