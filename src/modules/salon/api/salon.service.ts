import Salon, { SalonDocument } from "../../../common/models/salon.schema";
import Session from "../../../common/models/session.schema";

export class SalonService {

  async createSalon(data: Partial<SalonDocument>): Promise<SalonDocument> {
    const salon = new Salon({
      ...data,
      dateCreation: new Date(),
    });
    return await salon.save();
  }

  async findSalonsByUser(userId: string): Promise<SalonDocument[]> {
    return await Salon.find({ createurId: userId }).exec();
  }

  async getAllSalons(): Promise<SalonDocument[]> {
    return await Salon.find().exec();
  }

  async updateSalon(id: string, data: Partial<SalonDocument>): Promise<SalonDocument | null> {
    return await Salon.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteSalon(id: string): Promise<SalonDocument | null> {
    return await Salon.findByIdAndDelete(id);
  }

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

  async existsSalonByName(name: string): Promise<boolean> {
    const count = await Salon.countDocuments({ nom: name });
    return count > 0;
  }

  async countSalonsByUser(userId: string): Promise<number> {
    return await Salon.countDocuments({ createurId: userId });
  }

  // Ajout dans la classe SalonService
async getUserLeaderboard(limit: number = 10): Promise<any[]> {
  const leaderboard = await Salon.aggregate([
    {
      $group: {
        _id: "$createurId",        // Grouper par créateur
        salonsCount: { $sum: 1 }    // Nombre de salons créés
      }
    },
    { $sort: { salonsCount: -1 } }, // Trier décroissant
    { $limit: limit },              // Limiter le nombre de résultats
    {
      $lookup: {                    // Récupérer les détails utilisateur (optionnel)
        from: "users",               // Le nom exact de ta collection users
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
        userName: "$user.nom"        // Adapter selon ton modèle User
      }
    }
  ]);

  return leaderboard;
}

}
