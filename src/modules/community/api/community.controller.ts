import { Request, Response } from 'express';
import CommunityService from './community.service';
import { CommunityModel } from '../../../common/models/community.model';

class CommunityController {
  // ✅ Créer une communauté
  static async createCommunity(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, creator } = req.body;
      console.log("BODY =>", req.body); // 🔍 debug
  
      const newCommunity = new CommunityModel({
        name,
        description,
        creator,
        members: [creator]
      });
  
      const savedCommunity = await newCommunity.save();
  
      return res.status(201).json(savedCommunity);
    } catch (error) {
      console.error("Erreur lors de la création de la communauté :", error);
      return res.status(500).json({ error: "Erreur lors de la création de la communauté" });
    }
  }
  

  // ✅ Récupérer toutes les communautés
  static async getAllCommunities(req: Request, res: Response): Promise<Response> {
    try {
      const communities = await CommunityService.getAllCommunities();

      if (!communities || communities.length === 0) {
        return res.status(404).json({ error: "No communities found" });
      }

      return res.json(communities);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to retrieve communities" });
    }
  }

  // ✅ Récupérer une communauté par son ID
  static async getCommunityById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const community = await CommunityService.getCommunityById(id.trim());

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      return res.json(community);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to retrieve community" });
    }
  }

  // ✅ Mettre à jour une communauté
  static async updateCommunity(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const updatedCommunity = await CommunityService.updateCommunity(id.trim(), name);

      if (!updatedCommunity) {
        return res.status(404).json({ error: "Community not found" });
      }

      return res.json({
        message: "Community updated successfully",
        community: updatedCommunity
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update community" });
    }
  }

  // ✅ Supprimer une communauté
  static async deleteCommunity(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const deletedCommunity = await CommunityService.deleteCommunity(id.trim());

      if (!deletedCommunity) {
        return res.status(404).json({ error: "Community not found" });
      }

      return res.json({ message: "Community deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete community" });
    }
  }

  // ✅ Vérifier si un utilisateur est membre
  static async isUserMember(req: Request, res: Response): Promise<Response> {
    try {
      const { idCommunity, idUser } = req.params;
      const isMember = await CommunityService.isUserMember(idCommunity.trim(), idUser.trim());

      return res.json({ isMember });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to check membership" });
    }
  }

  // ✅ Ajouter un membre à une communauté
  static async addMemberToCommunity(req: Request, res: Response): Promise<Response> {
    try {
      const { idCommunity, idUser } = req.params;
      const updated = await CommunityService.addMemberToCommunity(idCommunity.trim(), idUser.trim());

      return res.json({ message: "Member added successfully", community: updated });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to add member" });
    }
  }

  // ✅ Supprimer un membre d'une communauté
  static async removeMemberFromCommunity(req: Request, res: Response): Promise<Response> {
    try {
      const { idCommunity, idUser } = req.params;
      const updated = await CommunityService.removeMemberFromCommunity(idCommunity.trim(), idUser.trim());

      return res.json({ message: "Member removed successfully", community: updated });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to remove member" });
    }
  }
}

export default CommunityController;