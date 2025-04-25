import mongoose from "mongoose";
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

  async updateForum(id: string, forumData: any) {
    return await forumSchema.findByIdAndUpdate(id, forumData, { new: true });
  }

  async deleteForum(id: string) {
    return await forumSchema.findByIdAndDelete(id);
  }

  async isUserParticipant(forumId: string, userId: string) {
    const forum = await forumSchema.findById(forumId);
    if (!forum) throw new Error("Forum not found");

    const userObjectId = new mongoose.Types.ObjectId(userId);
    return forum.comments.some((commentId) => commentId.equals(userObjectId));
  }

  async addParticipantToForum(forumId: string, userId: string) {
    const forum = await forumSchema.findById(forumId);
    if (!forum) throw new Error("Forum not found");

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isAlreadyParticipant = forum.comments.some((id) => id.equals(userObjectId));

    if (!isAlreadyParticipant) {
      forum.comments.push(userObjectId);
      await forum.save();
    }
    return forum;
  }

  async removeParticipantFromForum(forumId: string, userId: string) {
    const forum = await forumSchema.findById(forumId);
    if (!forum) throw new Error("Forum not found");

    const userObjectId = new mongoose.Types.ObjectId(userId);
    forum.comments = forum.comments.filter((id) => !id.equals(userObjectId));

    await forum.save();
    return forum;
  }

  async rateForum(forumId: string, userId: string, score: number) {
    const forum = await forumSchema.findById(forumId);
    if (!forum) throw new Error("Forum not found");

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const existingRating = forum.ratings.find((r) => r.user.equals(userObjectId));

    if (existingRating) {
      existingRating.score = score; // update
    } else {
      forum.ratings.push({ user: userObjectId, score }); // new rating
    }

    await forum.save();
    return forum;
  }

  async getForumsByUser(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await forumSchema.find({ author: userObjectId });
  }
}

export default new ForumService();
