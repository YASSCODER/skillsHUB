import mongoose from "mongoose";
import forumSchema from "../../../common/models/types/forum.schema";
import axios from "axios";

class ForumService {
  // Method removed (duplicate implementation)
  // Récupérer tous les forums
  async getAllForums() {
    return await forumSchema.find();
  }

  // Récupérer un forum par son ID
  async getForumById(id: string) {
    return await forumSchema.findById(id);
  }

  // Mettre à jour un forum
  async updateForum(id: string, forumData: any) {
    return await forumSchema.findByIdAndUpdate(id, forumData, { new: true });
  }

  // Supprimer un forum
  async deleteForum(id: string) {
    return await forumSchema.findByIdAndDelete(id);
  }
   
  async rateForum(forumId: string, userId: string, score: number) {
    const forum = await forumSchema.findById(forumId);
    if (!forum) throw new Error("Forum not found");

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const existingRating = forum.ratings.find((r) => r.user.equals(userObjectId));

    if (existingRating) {
      existingRating.score = score; // Mettre à jour la note
    } else {
      forum.ratings.push({ user: userObjectId, score }); // Ajouter une nouvelle note
    }

    await forum.save();
    return forum;
  }

  // Récupérer tous les forums d'un utilisateur
  async getForumsByUser(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await forumSchema.find({ author: userObjectId });
  }
  // Add this method to your ForumService class
async createForum(forumData: any) {
  const newForum = new forumSchema(forumData);
  return await newForum.save();
}
}


export default new ForumService();
