import { Request, Response } from 'express';
import ForumService from './forum.services';
import Forum from '../../../common/models/types/forum.schema';

class ForumController {
  async getAllForums(req: Request, res: Response): Promise<void> {
    try {
      const forums = await ForumService.getAllForums();
      res.json(forums);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch forums' });
    }
  }

  async getForumById(req: Request, res: Response): Promise<void> {
    try {
      const forum = await ForumService.getForumById(req.params.id);
      if (!forum) {
         res.status(404).json({ error: 'Forum not found' });
      }
      res.json(forum);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch forum' });
    }
  }

  async createForum(req: Request, res: Response): Promise<void> {
    try {
      const newForum = await ForumService.createForum(req.body);
      res.status(201).json(newForum);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create forum', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async updateForum(req: Request, res: Response): Promise<void> {
    try {
      const updatedForum = await ForumService.updateForum(req.params.id, req.body);
      if (!updatedForum) {
        res.status(404).json({ error: 'Forum not found' });
      }
      res.json(updatedForum);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update forum' });
    }
  }

  async deleteForum(req: Request, res: Response): Promise<void> {
    try {
      const deletedForum = await ForumService.deleteForum(req.params.id);
      if (!deletedForum) {
        res.status(404).json({ error: 'Forum not found' });
      }
      res.json({ message: 'Forum deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete forum' });
    }
  }

  async rateForum(req: Request, res: Response): Promise<void> {
    try {
      const { forumId, userId } = req.params;
      const { score } = req.body;
      const forum = await ForumService.rateForum(forumId, userId, score);
      res.json(forum);
    } catch (error) {
      res.status(500).json({ error: 'Failed to rate forum' });
    }
  }

  async getForumsByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const forums = await ForumService.getForumsByUser(userId);
      res.json(forums);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch forums by user' });
    }
  }

  // ==================== COMMENT ENDPOINTS ====================

  // GET /api/forums/:forumId/comments - Récupérer tous les commentaires d'un forum
  async getForumComments(req: Request, res: Response): Promise<void> {
    try {
      const { forumId } = req.params;
      console.log('📝 Getting comments for forum:', forumId);

      const comments = await ForumService.getForumComments(forumId);

      console.log(`✅ Found ${comments.length} comments for forum ${forumId}`);
      res.json({
        success: true,
        data: comments,
        count: comments.length
      });
    } catch (error) {
      console.error('❌ Error getting forum comments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch forum comments',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/forums/:forumId/comments - Ajouter un commentaire à un forum
  async addCommentToForum(req: Request, res: Response): Promise<void> {
    try {
      const { forumId } = req.params;
      const commentData = req.body;

      console.log('💬 Adding comment to forum:', forumId);
      console.log('💬 Comment data:', commentData);

      const newComment = await ForumService.addCommentToForum(forumId, commentData);

      if (!newComment) {
        res.status(500).json({
          success: false,
          error: 'Failed to create comment'
        });
        return;
      }

      console.log('✅ Comment added successfully:', newComment._id);
      res.status(201).json({
        success: true,
        data: newComment,
        message: 'Comment added successfully'
      });
    } catch (error) {
      console.error('❌ Error adding comment to forum:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add comment to forum',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE /api/forums/:forumId/comments/:commentId - Supprimer un commentaire
  async deleteCommentFromForum(req: Request, res: Response): Promise<void> {
    try {
      const { forumId, commentId } = req.params;

      console.log('🗑️ Deleting comment:', commentId, 'from forum:', forumId);

      const deletedComment = await ForumService.deleteCommentFromForum(forumId, commentId);

      console.log('✅ Comment deleted successfully');
      res.json({
        success: true,
        data: deletedComment,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('❌ Error deleting comment from forum:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete comment from forum',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/forums/:forumId/comments/:commentId/like - Liker un commentaire
  async likeComment(req: Request, res: Response): Promise<void> {
    try {
      const { forumId, commentId } = req.params;

      console.log('❤️ Liking comment:', commentId, 'in forum:', forumId);

      const result = await ForumService.likeComment(forumId, commentId);

      console.log('✅ Comment liked successfully');
      res.json({
        success: true,
        data: result,
        message: 'Comment liked successfully'
      });
    } catch (error) {
      console.error('❌ Error liking comment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to like comment',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}


export default new ForumController();
