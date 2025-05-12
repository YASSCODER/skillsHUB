import { isValidObjectId } from "mongoose";
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

  async updateSalonByName(nom: string, data: Partial<SalonDocument>): Promise<SalonDocument | null> {
    console.log("Tentative de mise à jour du salon avec le nom :", nom);
  
    const updatedSalon = await Salon.findOneAndUpdate(
      { nom: nom }, // Recherche le salon par son nom
      data,         // Données à mettre à jour (ne doit contenir que la description)
      { new: true } // Retourne le salon mis à jour
    ).exec();
  
    if (!updatedSalon) {
      console.log("Salon introuvable pour la mise à jour :", nom);
    }
  
    return updatedSalon;
  }
  

  async deleteSalonByName(nom: string): Promise<SalonDocument | null> {
    return await Salon.findOneAndDelete({ nom: nom }).exec(); // Recherche et suppression par nom
  }  

// backend — salon.service.ts
async getSalonByName(nom: string): Promise<SalonDocument[]> {
  return await Salon.find({
    nom: { $regex: new RegExp(nom, "i") }, // Match partiel, insensible à la casse
  }).exec();
}


  // Récupérer tous les salons créés par un utilisateur
  async findSalonsByUser(userId: string): Promise<SalonDocument[]> {
    if (!isValidObjectId(userId)) {
      throw new Error("ID de créateur invalide");
    }
    return await Salon.find({ createurId: userId }).exec();
  }

  // Vérifier si un salon existe déjà par son nom
  async existsSalonByName(name: string): Promise<boolean> {
    const count = await Salon.countDocuments({ nom: name });
    return count > 0;
  }
  // Compter le nombre de salons créés par un utilisateur
  async countSalonsByUser(userId: string): Promise<number> {
    if (!isValidObjectId(userId)) {
      throw new Error("ID de créateur invalide");
    }
    return await Salon.countDocuments({ createurId: userId });
  }

  // Récupérer le classement des utilisateurs avec le plus de salons
  async getUserLeaderboard(limit: number = 10): Promise<any[]> {
    const leaderboard = await Salon.aggregate([
      {
        $group: {
          _id: "$createurId",
          salonsCount: { $sum: 1 }
        }
      },
      { $sort: { salonsCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: "$_id",
          salonsCount: 1,
          userName: "$user.nom"
        }
      }
    ]);
    return leaderboard;
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

  async findByNom(nom: string): Promise<any> {
    return Salon.findOne({ nom }); // Rechercher un salon par son nom dans la base de données
  }
}
