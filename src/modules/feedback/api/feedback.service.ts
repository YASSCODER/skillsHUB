import { Feed } from "../../../common/models/interface/feedback.inteface";
import feedbackSchema from "../../../common/models/types/feedback.schema";
import { PipelineStage, Types } from "mongoose";
import { fetchRandomActivity } from "../../../common/utils/bored-api.utils";
import { analyzePersonalityLocally } from "../../../common/utils/analyzePersonalityLocally";
import UserService from "../../user/api/user.service";


export class FeedbackService {

  private userService: UserService;

  constructor() {
    this.userService = new UserService(); // ✅ Initialisation
  }


  async create(data: Partial<Feed>) {
    // Ajout d'une activité amusante
    data.funActivity = await fetchRandomActivity();
  
    // Analyse des traits de personnalité
    if (data.comment) {
      data.personalityTraits = analyzePersonalityLocally(data.comment);
    }
  
    return await feedbackSchema.create(data);
  }


  async findAll() {
    return await feedbackSchema.find();
  }

  async findById(id: string) {
    return await feedbackSchema.findById(id);
  }

  async update(id: string, data: Partial<Feed>) {

    if (data.comment) {
    
      data.funActivity = await fetchRandomActivity(); // 🔥 Ajoute une nouvelle activité
   
    }

    return await feedbackSchema.findByIdAndUpdate(id, data, { new: true });
  
  }

  async delete(id: string) {
    return await feedbackSchema.findByIdAndDelete(id);
  }

  //Obtenir la note moyenne d’un utilisateur
  async getAverageRatingForUser(userId: string): Promise<number> {
    // Vérifier si l'userId est valide
    if (!Types.ObjectId.isValid(userId)) {
      console.log(`UserId invalide: ${userId}`);
      return 0;
    }

    // Convertir en ObjectId pour assurer la compatibilité
    const objectId = new Types.ObjectId(userId);
    
    // Rechercher les feedbacks pour cet utilisateur
    const feedbacks = await feedbackSchema.find({ targetUserId: objectId });
    
    // Si aucun feedback n'est trouvé, retourner 0
    if (feedbacks.length === 0) {
      console.log(`Aucun feedback trouvé pour l'utilisateur ${userId}`);
      return 0;
    }
    
    // Calculer la moyenne des ratings
    const total = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
    const average = total / feedbacks.length;
    
    console.log(`${feedbacks.length} feedbacks trouvés pour l'utilisateur ${userId}, moyenne: ${average}`);
    return average;
  }


  //Lister les utilisateurs les mieux notés (top 5)

  async getTopRatedUsers(limit: number = 5) {
    const pipeline: PipelineStage[] = [
      {
        $group: {
          _id: "$targetUserId",
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          averageRating: -1,
          count: -1
        }
      },
      {
        $limit: 5
      }
    ];
    
    return await feedbackSchema.aggregate(pipeline);
  }

  // ✅ Nouvelle méthode pour récupérer le nom complet de l'utilisateur
  async getUsernameById(userId: string): Promise<string | null> {
    try {
      const user = await this.userService.getUserById(userId); // ✅ Utilisation de l'instance de UserService
      return user ? user.fullName : null;
    } catch (error) {
      console.error("Erreur lors de la récupération du nom d'utilisateur :", error);
      return null;
    }
  }


  


}
