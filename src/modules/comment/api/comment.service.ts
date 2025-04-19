import commentSchema from "../../../common/models/types/user.schema";

class CommentService {
  static async getAllComments() {
    return await commentSchema.find();
  }

  static async getCommentById(id: string) {
    return await commentSchema.findById(id);
  }

  static async createComment(CommentData: any) {
    return await commentSchema.create(CommentData);
  }

  static async updateComment(id: string, CommentData: any) {
    return await commentSchema.findByIdAndUpdate(id, CommentData, { new: true });
  }

  static async deleteComment(id: string) {
    return await commentSchema.findByIdAndDelete(id);
  }
}

export default CommentService;
