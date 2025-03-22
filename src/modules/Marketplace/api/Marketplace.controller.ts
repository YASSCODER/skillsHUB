import { Request, Response } from "express";
import MarketplaceService from "./Marketplace.service"
import MarketplaceSchema from "../../../common/models/types/marketplace.schema";
class MarketplaceController {
  static async getAllOffers(req: Request, res: Response) {
    try {
      const offers = await MarketplaceService.getAllOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch offers" });
    }
  }

  static async getofferById(req: Request, res: Response) {
    try {
      const offer = await MarketplaceService.getofferById(req.params.id);
      if (!offer) return res.status(404).json({ error: "offer not found" });
      res.json(offer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch offer" });
    }
  }

  static async createOffer(req: Request, res: Response) {
    try {
      const newoffer = await MarketplaceService.createOffer(req.body);
      res.status(201).json(newoffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to create offer" });
    }
  }

  static async updateOffer(req: Request, res: Response) {
    try {
      const updatedoffer = await MarketplaceService.updateOffer(req.params.id, req.body);
      if (!updatedoffer)
        return res.status(404).json({ error: "offer not found" });
      res.json(updatedoffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update offer" });
    }
  }

  static async deleteOffer(req: Request, res: Response) {
    try {
      const deletedoffer = await MarketplaceService.deleteOffer(req.params.id);
      if (!deletedoffer)
        return res.status(404).json({ error: "offer not found" });
      res.json({ message: "offer deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete offer" });
    }
  }
  //récément ajouté pas encore vérifié
  static async getOffersByFilter(req: Request, res: Response) {
    try {
      const { userId, category, skill } = req.query;
      let filter: any = {};
  
      if (userId) filter.userId = userId;
      if (category) filter.category = category;
      if (skill) filter.skillsRequired = { $in: [skill] };
  
      const offers = await MarketplaceSchema.find(filter)
        .populate("userId", "name email")  // Récupérer les infos du user
        .populate("category", "name")  // Récupérer le nom de la catégorie
        .populate("skillsRequired", "name"); // Récupérer les skills associées
  
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des offres." });
    }
  }

}

export default MarketplaceController;
