import { Request, Response } from "express";
import { FeedbackService } from "./feedback.service";

const feedbackService = new FeedbackService();

export class FeedbackController {
   async createFeedback(req: Request, res: Response) {
    try {
      const feedback = await feedbackService.create(req.body);
      res.status(201).json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la création du feedback", error });
    }
  }

   async getAllFeedbacks(req: Request, res: Response) {
    try {
      const feedbacks = await feedbackService.findAll();
      res.status(200).json(feedbacks);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des feedbacks", error });
    }
  }

   async getFeedbackById(req: Request, res: Response) {
    try {
      const feedback = await feedbackService.findById(req.params.id);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback non trouvé" });
      }
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération du feedback", error });
    }
  }

   async updateFeedback(req: Request, res: Response) {
    try {
      const feedback = await feedbackService.update(req.params.id, req.body);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback non trouvé" });
      }
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la mise à jour du feedback", error });
    }
  }

  async deleteFeedback(req: Request, res: Response) {
    try {
      const deleted = await feedbackService.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Feedback non trouvé" });
      }
      res.status(200).json({ message: "Feedback supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression du feedback", error });
    }
  }

  async getAverageRating(req: Request, res: Response) {
    try {
      const average = await feedbackService.getAverageRatingForUser(req.params.userId);
      res.status(200).json({ userId: req.params.userId, averageRating: average });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors du calcul de la note moyenne", error });
    }
  }
  
  
  async getTopRatedUsers(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const topUsers = await feedbackService.getTopRatedUsers(limit);
      res.status(200).json(topUsers);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des meilleurs utilisateurs", error });
    }
  }
}