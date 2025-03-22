import { IChallenge } from "../../../common/models/interface/challenge.interface";
import challengeSchema from "../../../common/models/types/challenge.schema";

export class ChallengeService {
  // ✅ Créer un challenge en base de données
  async create(payload: IChallenge) {
    try {
      return await challengeSchema.create(payload);
    } catch (error) {
      console.error("Erreur lors de la création du challenge :", error);
      throw new Error("Impossible de créer le challenge.");
    }
  }

  // ✅ Récupérer tous les challenges depuis MongoDB
  async findAll(): Promise<IChallenge[]> {
    try {
      return await challengeSchema.find();
    } catch (error) {
      console.error("Erreur lors de la récupération des challenges :", error);
      throw new Error("Impossible de récupérer les challenges.");
    }
  }

  // ✅ Trouver un challenge par ID
  async findById(id: string): Promise<IChallenge | null> {
    try {
      return await challengeSchema.findById(id);
    } catch (error) {
      console.error("Erreur lors de la récupération du challenge :", error);
      throw new Error("Impossible de récupérer le challenge.");
    }
  }

  // ✅ Mettre à jour un challenge
  async update(
    id: string,
    updatedChallenge: Partial<IChallenge>
  ): Promise<IChallenge | null> {
    try {
      return await challengeSchema.findByIdAndUpdate(id, updatedChallenge, {
        new: true,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du challenge :", error);
      throw new Error("Impossible de mettre à jour le challenge.");
    }
  }

  // ✅ Supprimer un challenge
  async delete(id: string): Promise<boolean> {
    try {
      const deletedChallenge = await challengeSchema.findByIdAndDelete(id);
      return !!deletedChallenge;
    } catch (error) {
      console.error("Erreur lors de la suppression du challenge :", error);
      throw new Error("Impossible de supprimer le challenge.");
    }
  }
}
