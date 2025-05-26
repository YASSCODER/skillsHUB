import { Request, Response } from "express";
import { SessionService } from "./session.service";
import { SalonService } from "../../salon/api/salon.service";
import { SessionDocument } from "../../../common/models/session.schema";
import dayjs from "dayjs";

const salonService = new SalonService(); // Service for managing salons
const sessionService = new SessionService(); // Service for managing sessions

export class SessionController {
  private sessionService: SessionService;

  constructor() {
    this.sessionService = new SessionService();
  }

  // Create a new session

    async searchSessions(req: Request, res: Response): Promise<Response> {
    try {
      const filters = req.query;
      const sessions = await sessionService.advancedSearch(filters);
      return res.status(200).json(sessions);
    } catch (error) {
      console.error("Erreur recherche avancée sessions :", error);
      return res.status(500).json({ error: "Erreur lors de la recherche des sessions." });
    }
  }
  async createSession(req: Request, res: Response): Promise<Response> {
    try {
      const { salonNom } = req.params; // Extract salon name from URL parameters
      const sessionData = req.body; // Extract session data from request body

      console.log("Tentative de création de session:", { salonNom, sessionData });

      // Vérifier que tous les champs requis sont présents
      const missingFields = [];
      if (!sessionData.type) missingFields.push('type');
      if (!sessionData.dateDebut) missingFields.push('dateDebut');
      if (!sessionData.dateFin) missingFields.push('dateFin');
      if (!sessionData.createurNom) missingFields.push('createurNom');

      if (missingFields.length > 0) {
        console.log("Données manquantes:", missingFields);
        return res.status(400).json({ 
          error: "Données incomplètes", 
          message: `Les champs suivants sont obligatoires: ${missingFields.join(', ')}`,
          missingFields
        });
      }

      // Find salon by name
      const salon = await salonService.findByNom(salonNom);
      if (!salon) {
        console.log("Salon introuvable:", salonNom);
        return res.status(404).json({ error: "Salon introuvable avec le nom spécifié" });
      }

      // Create session with salon ID and provided data
      const session = await sessionService.createSession(salon._id, sessionData);
      console.log("Session créée avec succès:", session);
      return res.status(201).json(session);
    } catch (error: any) {
      console.error("Erreur lors de la création de la session :", error);
      return res.status(400).json({ 
        error: "Validation échouée", 
        message: error.message || "Erreur inconnue" 
      });
    }
  }

  // Get all sessions for a specific user
  async getSessionsByUser(req: Request, res: Response): Promise<Response> {
    try {
      const sessions = await sessionService.findSessionsByUser(req.params.userId);
      return res.status(200).json(sessions);
    } catch (error) {
      console.error("Erreur lors de la récupération des sessions :", error);
      return res.status(500).json({ error: "Erreur lors de la récupération des sessions" });
    }
  }

  // Get all sessions
  async getAllSessions(req: Request, res: Response): Promise<Response> {
    try {
      const sessions = await sessionService.getAllSessions();
      return res.status(200).json(sessions);
    } catch (error) {
      console.error("Erreur lors de la récupération des sessions :", error);
      return res.status(500).json({ error: "Erreur lors de la récupération des sessions" });
    }
  }

  // Get a session by its ID
  async getSessionById(req: Request, res: Response): Promise<Response> {
    try {
      const session = await sessionService.getSessionById(req.params.id);
      if (!session) return res.status(404).json({ error: "Session non trouvée" });
      return res.status(200).json(session);
    } catch (error) {
      console.error("Erreur lors de la récupération de la session :", error);
      return res.status(500).json({ error: "Erreur lors de la récupération de la session" });
    }
  }

  // Update a session by its ID
  async updateSession(req: Request, res: Response): Promise<Response> {
    try {
      const sessionId = req.params.id;
      const { etat, dateDebut, dateFin, createurNom } = req.body;

      console.log("Reçu pour mise à jour :", { sessionId, etat, dateDebut, dateFin, createurNom });

      // Validate and format dates
      if (dateDebut || dateFin) {
        const formattedDateDebut = dateDebut ? new Date(dateDebut) : undefined;
        const formattedDateFin = dateFin ? new Date(dateFin) : undefined;

        if (formattedDateDebut && isNaN(formattedDateDebut.getTime())) {
          return res.status(400).json({ error: "Le format de la dateDebut est invalide." });
        }
        if (formattedDateFin && isNaN(formattedDateFin.getTime())) {
          return res.status(400).json({ error: "Le format de la dateFin est invalide." });
        }
        if (formattedDateDebut && formattedDateFin && formattedDateFin <= formattedDateDebut) {
          return res.status(400).json({ error: "La dateFin doit être après la dateDebut." });
        }

        req.body.dateDebut = formattedDateDebut;
        req.body.dateFin = formattedDateFin;
      }

      const updatedSession = await sessionService.updateSession(sessionId, req.body);
      if (!updatedSession) return res.status(404).json({ error: "Session non trouvée." });

      return res.status(200).json({ message: "Session mise à jour avec succès.", session: updatedSession });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la session :", error);
      return res.status(500).json({ error: "Erreur lors de la mise à jour de la session." });
    }
  }

  // Delete a session
  async deleteSession(req: Request, res: Response): Promise<Response> {
    try {
      const session = await sessionService.deleteSession(req.params.id);
      if (!session) return res.status(404).json({ error: "Session non trouvée" });
      return res.status(200).json({ message: "Session supprimée avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression de la session :", error);
      return res.status(500).json({ error: "Erreur lors de la suppression de la session" });
    }
  }

  // Count sessions by salon
  async countSessionsBySalon(req: Request, res: Response): Promise<Response> {
    try {
      const count = await sessionService.countSessionsBySalon(req.params.salonId);
      return res.status(200).json({ count });
    } catch (error) {
      console.error("Erreur lors du comptage des sessions :", error);
      return res.status(500).json({ error: "Erreur lors du comptage des sessions" });
    }
  }

  // Get sessions by type
  async getSessionsByType(req: Request, res: Response): Promise<Response> {
    try {
      const sessions = await sessionService.getSessionsByType(req.params.type as "chat" | "meet");
      return res.status(200).json(sessions);
    } catch (error) {
      console.error("Erreur lors de la récupération des sessions par type :", error);
      return res.status(500).json({ error: "Erreur lors de la récupération des sessions par type" });
    }
  }

  // Create multiple sessions
  async createMultipleSessions(req: Request, res: Response): Promise<Response> {
    try {
      const { salonId } = req.params;
      const sessionsData = req.body.map((session: Partial<SessionDocument>) => ({
        ...session,
        salonId,
      }));

      const sessions = await sessionService.createMultipleSessions(sessionsData);
      return res.status(201).json(sessions);
    } catch (error) {
      console.error("Erreur lors de la création des sessions multiples :", error);
      return res.status(500).json({ error: "Erreur lors de la création des sessions multiples" });
    }
  }

  // Get average session duration
  async getAverageSessionDuration(req: Request, res: Response): Promise<Response> {
    try {
      const average = await sessionService.getAverageSessionDuration();
      return res.status(200).json({ averageDurationInMinutes: average });
    } catch (error) {
      console.error("Erreur lors du calcul de la durée moyenne des sessions :", error);
      return res.status(500).json({ error: "Erreur lors du calcul de la durée moyenne des sessions" });
    }
  }

  // Get sessions by salon
  async getSessionsBySalon(req: Request, res: Response): Promise<Response> {
    try {
      const { salonId } = req.params;
      const sessions = await sessionService.findSessionsBySalon(salonId);
      return res.status(200).json(sessions);
    } catch (error) {
      console.error("Erreur lors de la récupération des sessions par salon :", error);
      return res.status(500).json({ error: "Erreur lors de la récupération des sessions par salon" });
    }
  }

  // Create a session for a specific salon
  async createSessionForSalon(req: Request, res: Response): Promise<Response> {
    try {
      const salonId = req.params.salonId;
      const sessionData = req.body;

      const session = await sessionService.createSession(salonId, sessionData);
      return res.status(201).json(session);
    } catch (error) {
      console.error("Erreur lors de la création de la session :", error);
      return res.status(500).json({ error: "Erreur lors de la création de la session" });
    }
  }

  // Nouvelle méthode pour récupérer les sessions par compétence
  async getSessionsBySkill(req: Request, res: Response) {
    const { skillId } = req.params;
    
    try {
      const sessions = await this.sessionService.getSessionsBySkill(skillId);
      return res.status(200).json(sessions);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // Nouvelle méthode pour récupérer les sessions par salon et compétence
  async getSessionsBySalonAndSkill(req: Request, res: Response) {
    const { salonId, skillId } = req.params;
    
    try {
      const sessions = await this.sessionService.getSessionsBySalonAndSkill(salonId, skillId);
      return res.status(200).json(sessions);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
