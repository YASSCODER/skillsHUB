import { Request, Response } from 'express';
import ForumService from './forum.services';

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
        return;
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
      res.status(500).json({ error: 'Failed to create forum' });
    }
  }

  async updateForum(req: Request, res: Response): Promise<void> {
    try {
      const updatedForum = await ForumService.updateForum(req.params.id, req.body);
      if (!updatedForum) {
        res.status(404).json({ error: 'Forum not found' });
        return;
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
        return;
      }
      res.json({ message: 'Forum deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete forum' });
    }
  }
  async isUserParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { forumId, userId } = req.params;
      const isParticipant = await ForumService.isUserParticipant(forumId, userId);
      res.json({ isParticipant });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check participant status' });
    }
  }

  async addParticipantToForum(req: Request, res: Response): Promise<void> {
    try {
      const { forumId, userId } = req.params;
      const updatedForum = await ForumService.addParticipantToForum(forumId, userId);
      res.json(updatedForum);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add participant' });
    }
  }

  async removeParticipantFromForum(req: Request, res: Response): Promise<void> {
    try {
      const { forumId, userId } = req.params;
      const updatedForum = await ForumService.removeParticipantFromForum(forumId, userId);
      res.json(updatedForum);
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove participant' });
    }
  }
}


export default new ForumController();
