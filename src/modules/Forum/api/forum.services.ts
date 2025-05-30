import mongoose from "mongoose";
import forumSchema from "../../../common/models/types/forum.schema";
import commentSchema from "../../../common/models/types/comment.schema";
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

  // ==================== COMMENT METHODS ====================

  // Récupérer tous les commentaires d'un forum
  async getForumComments(forumId: string) {
    try {
      const forum = await forumSchema.findById(forumId).populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'fullName email'
        }
      });

      if (!forum) {
        throw new Error("Forum not found");
      }

      return forum.comments || [];
    } catch (error) {
      console.error('Error fetching forum comments:', error);
      throw error;
    }
  }

  // Ajouter un commentaire à un forum
  async addCommentToForum(forumId: string, commentData: any) {
    try {
      // Créer le nouveau commentaire
      const newComment = new commentSchema({
        body: commentData.content, // Map 'content' to 'body'
        author: new mongoose.Types.ObjectId(commentData.author),
        forum: new mongoose.Types.ObjectId(forumId)
      });

      // Sauvegarder le commentaire
      const savedComment = await newComment.save();

      // Ajouter le commentaire au forum
      await forumSchema.findByIdAndUpdate(
        forumId,
        { $push: { comments: savedComment._id } },
        { new: true }
      );

      // Retourner le commentaire avec les données de l'auteur
      const populatedComment = await commentSchema.findById(savedComment._id).populate('author', 'fullName email');

      return populatedComment;
    } catch (error) {
      console.error('Error adding comment to forum:', error);
      throw error;
    }
  }

  // Supprimer un commentaire d'un forum
  async deleteCommentFromForum(forumId: string, commentId: string) {
    try {
      // Supprimer le commentaire
      const deletedComment = await commentSchema.findByIdAndDelete(commentId);

      if (!deletedComment) {
        throw new Error("Comment not found");
      }

      // Retirer le commentaire du forum
      await forumSchema.findByIdAndUpdate(
        forumId,
        { $pull: { comments: commentId } },
        { new: true }
      );

      return deletedComment;
    } catch (error) {
      console.error('Error deleting comment from forum:', error);
      throw error;
    }
  }

  // Liker un commentaire (simple increment pour la démo)
  async likeComment(forumId: string, commentId: string) {
    try {
      // Pour l'instant, on retourne juste une confirmation
      // Vous pouvez ajouter une logique de likes plus complexe plus tard
      const comment = await commentSchema.findById(commentId);

      if (!comment) {
        throw new Error("Comment not found");
      }

      return {
        success: true,
        message: "Comment liked successfully",
        commentId: commentId
      };
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  }
}


export default new ForumService();
