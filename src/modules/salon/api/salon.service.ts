import mongoose, { isValidObjectId } from "mongoose";
import Salon, { SalonDocument } from "../../../common/models/salon.schema";
import Session from "../../../common/models/session.schema";

export class SalonService {
  // Récupérer un salon par ID
  async getSalonById(id: string): Promise<SalonDocument | null> {
    if (!isValidObjectId(id)) {
      throw new Error("ID de salon invalide");
    }
    return await Salon.findById(id).exec();
  }

  // Créer un salon
  async createSalon(data: Partial<SalonDocument>): Promise<SalonDocument> {
    if (!data.nom) {
      throw new Error("Le nom du salon est requis");
    }

    if (!data.createurId || !isValidObjectId(data.createurId)) {
      throw new Error("L'identifiant du créateur est invalide");
    }

    const salon = new Salon({
      ...data,
      dateCreation: new Date(),
    });

    return await salon.save();
  }

  // Récupérer tous les salons
  async getAllSalons(): Promise<SalonDocument[]> {
    return await Salon.find().exec();
  }

  // Récupérer les salons par compétence
  async getSalonsBySkill(skillId: string): Promise<SalonDocument[]> {
    if (!isValidObjectId(skillId)) {
      throw new Error("ID de compétence invalide");
    }
    return await Salon.find({ skillId }).exec();
  }

  // Récupérer les salons avec leurs sessions associées
  async getSalonsWithSessions(): Promise<any[]> {
    return await Salon.aggregate([
      {
        $lookup: {
          from: "sessions",
          localField: "_id",
          foreignField: "salonId",
          as: "sessions"
        }
      }
    ]);
  }

  // Récupérer les salons avec leurs sessions associées et filtrer par compétence
  async getSalonsWithSessionsBySkill(skillId: string): Promise<any[]> {
    if (!isValidObjectId(skillId)) {
      throw new Error("ID de compétence invalide");
    }
    
    return await Salon.aggregate([
      {
        $match: { skillId: new mongoose.Types.ObjectId(skillId) }
      },
      {
        $lookup: {
          from: "sessions",
          localField: "_id",
          foreignField: "salonId",
          as: "sessions"
        }
      }
    ]);
  }

  async findByNom(nom: string): Promise<any> {
    return Salon.findOne({ nom });
  }

  // Récupérer le leaderboard des utilisateurs basé sur leurs salons
  async getUserLeaderboard(): Promise<any[]> {
    return await Salon.aggregate([
      {
        $group: {
          _id: "$createurId",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
  }
}
