import { Request, Response } from "express";
import { SalonService } from "./salon.service";
import { SessionService } from "../../session/api/session.service";
import Salon from "../../../common/models/salon.schema";
import Session from "../../../common/models/session.schema";

const salonService = new SalonService();
const sessionService = new SessionService();

export class SalonController {
  async createSalon(req: Request, res: Response) {
    try {
      const salon = await salonService.createSalon(req.body);
      res.status(201).json(salon);
    } catch (error: any) {
      console.error("Erreur création salon :", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  async getAllSalons(req: Request, res: Response) {
    try {
      const salons = await salonService.getAllSalons();
      res.status(200).json(salons);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des salons" });
    }
  }
 // Récupérer les salons avec leurs sessions associées
  async getSalonsWithSessions(req: Request, res: Response): Promise<Response> {
    try {
      // Récupérer tous les salons
      const salons = await Salon.find();

      // Préparer un tableau pour stocker les salons avec leurs sessions associées
      const salonsWithSessions = await Promise.all(
        salons.map(async (salon) => {
          const sessions = await Session.find({ salonId: salon._id }); // Récupérer les sessions associées
          return {
            salon: {
              id: salon._id,
              nom: salon.nom,
              description: salon.description,
              dateCreation: salon.dateCreation,
              createurId: salon.createurId,
            },
            sessions: sessions.map((session) => ({
              id: session._id,
              type: session.type,
              dateDebut: session.dateDebut,
              dateFin: session.dateFin,
              etat: session.etat,
              createurNom: session.createurNom,
            })),
          };
        })
      );

      return res.status(200).json(salonsWithSessions); // Retourner les salons avec leurs sessions
    } catch (error) {
      console.error("Erreur lors de la récupération des salons et sessions :", error);
      return res.status(500).json({ error: "Erreur lors de la récupération des salons et sessions" });
    }
  }
 
 

  async getSalonById(req: Request, res: Response) {
    try {
      const salon = await salonService.getSalonById(req.params.id);
      if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
      res.status(200).json(salon);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération du salon" });
    }
  }

  async getSalonByName(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const salons = await salonService.getSalonByName(decodeURIComponent(name));
      if (!salons || salons.length === 0) {
        return res.status(404).json({ error: "Aucun salon trouvé avec ce nom" });
      }
      res.status(200).json(salons); // maintenant on renvoie un tableau ✅
    } catch (error) {
      console.error("Erreur :", error);
      res.status(500).json({ error: "Erreur lors de la récupération du salon par nom" });
    }
  }

  async getSalonsByUser(req: Request, res: Response) {
    try {
      const salons = await salonService.findSalonsByUser(req.params.userId);
      res.status(200).json(salons);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des salons" });
    }
  }
  async updateSalonByName(req: Request, res: Response) {
    try {
      const { name } = req.params;
  
      console.log("Nom du salon à mettre à jour :", name);
  
      if (!name) {
        return res.status(400).json({ error: "Nom du salon manquant" });
      }
  
      // Supprimez explicitement le champ 'nom' du corps de la requête
      if (req.body.nom) {
        delete req.body.nom;
      }
  
      const updatedSalon = await salonService.updateSalonByName(name, req.body);
  
      if (!updatedSalon) {
        return res.status(404).json({ error: "Salon non trouvé" });
      }
  
      console.log("Salon mis à jour avec succès :", updatedSalon);
      res.status(200).json(updatedSalon);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      res.status(500).json({ error: "Erreur lors de la mise à jour du salon" });
    }
  }
  
  async deleteSalon(req: Request, res: Response) {
    try {
      const { name } = req.params; // On récupère le nom du salon
      const salon = await salonService.deleteSalonByName(name); // Appel au service pour supprimer par nom
      if (!salon) {
        return res.status(404).json({ error: "Salon non trouvé" });
      }
      res.status(200).json({ message: "Salon supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression du salon" });
    }
  }
  
  async existsSalonByName(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const exists = await salonService.existsSalonByName(name);
      res.status(200).json({ exists });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la vérification du salon" });
    }
  }

  async countSalonsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const count = await salonService.countSalonsByUser(userId);
      res.status(200).json({ count });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors du comptage des salons" });
    }
  }

  async getUserLeaderboard(req: Request, res: Response) {
    try {
      const leaderboard = await salonService.getUserLeaderboard();
      res.status(200).json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération du leaderboard" });
    }  }
}
