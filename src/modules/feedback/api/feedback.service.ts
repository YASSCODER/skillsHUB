import { Feed } from "../../../common/models/interface/feedback.inteface";
import feedbackSchema from "../../../common/models/types/feedback.schema";
import { PipelineStage, Types } from "mongoose";
import { fetchRandomActivity } from "../../../common/utils/bored-api.utils";
import { analyzePersonalityLocally } from "../../../common/utils/analyzePersonalityLocally";


export class FeedbackService {


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
    const feedbacks = await feedbackSchema.find({ targetUserId: userId });
    if (feedbacks.length === 0) return 0;
  
    const total = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
    return total / feedbacks.length;
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


  


}