import forumSchema from "../../../common/models/types/forum.schema";


class ForumService {
  async getAllForums() {
    return await forumSchema.find();
  }

  async getForumById(id: string) {
    return await forumSchema.findById(id);
  }

  async createForum(forumData: any) {
    const forum = new forumSchema(forumData);
    return await forum.save();
  }

  async updateForum(id: string, forumData: any){
    return await forumSchema.findByIdAndUpdate(id, forumData, { new: true });
  }

  async deleteForum(id: string) {
    return  await forumSchema.findByIdAndDelete(id);
  }
  
  // Vérifier si un utilisateur est déjà membre du forum
  async isUserParticipant(forumId: string, userId: string) {
    const forum = await forumSchema.findById(forumId);
    if (!forum) {
      throw new Error('Forum not found');
    }
    // Vérifie si l'ID de l'utilisateur est présent dans les commentaires (ou la liste des participants)
    return forum.comments.includes(userId);
  }

  // Ajouter un utilisateur en tant que participant au forum
  async addParticipantToForum(forumId: string, userId: string) {
    const forum = await forumSchema.findById(forumId);
    if (!forum) {
      throw new Error('Forum not found');
    }

    // Vérifie si l'utilisateur est déjà un participant, sinon on l'ajoute
    if (!forum.comments.includes(userId)) {
      forum.comments.push(userId);
      await forum.save();
    }
    return forum;
  }

  // Retirer un utilisateur du forum
  async removeParticipantFromForum(forumId: string, userId: string) {
    const forum = await forumSchema.findById(forumId);
    if (!forum) {
      throw new Error('Forum not found');
    }

    // Retirer l'utilisateur des commentaires (ou participants)
    forum.comments = forum.comments.filter((comment: mongoose.Types.ObjectId) => !comment.equals(userId));
    await forum.save();
    return forum;
  }
}



export default new ForumService();
