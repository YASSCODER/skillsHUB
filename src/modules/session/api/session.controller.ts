import { Request, Response } from "express";
import { SessionService } from "./session.service";

const sessionService = new SessionService();

export class SessionController {
  async createSession(req: Request, res: Response) {
    try {
      const session = await sessionService.createSession(req.body);
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la création de la session" });
    }
  }

  async getSessionsByUser(req: Request, res: Response) {
    try {
      const sessions = await sessionService.findSessionsByUser(req.params.userId);
      res.status(200).json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des sessions" });
    }
  }

  async getAllSessions(req: Request, res: Response) {
    try {
      const sessions = await sessionService.getAllSessions();
      res.status(200).json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des sessions" });
    }
  }

  async updateSession(req: Request, res: Response) {
    try {
      const session = await sessionService.updateSession(req.params.id, req.body);
      if (!session) return res.status(404).json({ error: "Session non trouvée" });
      res.status(200).json(session);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour de la session" });
    }
  }

  async deleteSession(req: Request, res: Response) {
    try {
      const session = await sessionService.deleteSession(req.params.id);
      if (!session) return res.status(404).json({ error: "Session non trouvée" });
      res.status(200).json({ message: "Session supprimée avec succès" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression de la session" });
    }
  }

  async countSessionsBySalon(req: Request, res: Response) {
    try {
      const count = await sessionService.countSessionsBySalon(req.params.salonId);
      res.status(200).json({ count });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors du comptage des sessions" });
    }
  }

  async getSessionsByType(req: Request, res: Response) {
    try {
      const sessions = await sessionService.getSessionsByType(req.params.type as "chat" | "meet");
      res.status(200).json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des sessions par type" });
    }
  }


  // ... autres méthodes ...

  async getAverageSessionDuration(req: Request, res: Response) {
    try {
      const average = await sessionService.getAverageSessionDuration();
      res.status(200).json({ averageDurationInMinutes: average });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors du calcul de la durée moyenne des sessions" });
    }
  }
}
