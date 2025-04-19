import { Request, Response } from "express";
import CommentService from "./comment.service";


class CommentController {
  static async getAllComments(req: Request, res: Response) {
    try {
      const comments = await CommentService.getAllComments();
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  static async getCommentById(req: Request, res: Response) {
    try {
      const comments = await CommentService.getCommentById(req.params.id);
      if (!comments) return res.status(404).json({ error: "comments not found" });
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  }

  static async createComment(req: Request, res: Response) {
    try {
      const newComment = await CommentService.createComment(req.body);
      res.status(201).json(newComment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  }

  static async updateComment(req: Request, res: Response) {
    try {
      const comment = await CommentService.updateComment(req.params.id, req.body);
      if (!comment)
        return res.status(404).json({ error: "comment not found" });
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update comment" });
    }
  }

  static async deleteComment(req: Request, res: Response) {
    try {
      const deletedComment = await CommentService.deleteComment(req.params.id);
      if (!deletedComment)
        return res.status(404).json({ error: "comment not found" });
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
}

export default CommentController;
