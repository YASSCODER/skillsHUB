import { Request, Response } from "express";
import { SalonService } from "./salon.service";

const salonService = new SalonService();

export class SalonController {
  async createSalon(req: Request, res: Response) {
    try {
      const salon = await salonService.createSalon(req.body);
      res.status(201).json(salon);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la création du salon" });
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

  async getAllSalons(req: Request, res: Response) {
    try {
      const salons = await salonService.getAllSalons();
      res.status(200).json(salons);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des salons" });
    }
  }

  async updateSalon(req: Request, res: Response) {
    try {
      const salon = await salonService.updateSalon(req.params.id, req.body);
      if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
      res.status(200).json(salon);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour du salon" });
    }
  }
  
  async deleteSalon(req: Request, res: Response) {
    try {
      const salon = await salonService.deleteSalon(req.params.id);
      if (!salon) return res.status(404).json({ error: "Salon non trouvé" });
      res.status(200).json({ message: "Salon supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression du salon" });
    }
  }

  async getSalonsWithSessions(req: Request, res: Response) {
    try {
      const salons = await salonService.getSalonsWithSessions();
      res.status(200).json(salons);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des salons avec sessions" });
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
    }
  }
  
}
