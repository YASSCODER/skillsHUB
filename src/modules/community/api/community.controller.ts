import { Request, Response } from 'express';
import communityService from './community.service';
import { CommunityModel } from '../../../common/models/community.model';
import Community from '../../../common/models/types/community.schema';

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
  

  static async getAllCommunities(req: Request, res: Response): Promise<Response> {
    try {
      const communities = await communityService.getAllCommunities();
      return res.status(200).json(communities);
    } catch (err) {
      return res.status(500).json({ error: 'Erreur récupération communautés', details: err });
    }
  }
  
  // ✅ Récupérer une communauté par son ID
  static async getCommunityById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const community = await communityService.getCommunityById(id.trim());

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
      const updatedCommunity = await communityService.updateCommunity(id.trim(), req.body);

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
      const deletedCommunity = await communityService.deleteCommunity(id.trim());

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
      const isMember = await communityService.isUserMember(idCommunity.trim(), idUser.trim());

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
      const updated = await communityService.addMemberToCommunity(idCommunity.trim(), idUser.trim());

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
      const updated = await communityService.removeMemberFromCommunity(idCommunity.trim(), idUser.trim());

      return res.json({ message: "Member removed successfully", community: updated });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to remove member" });
    }
  }

  // ✅ Rechercher des communautés
  static async searchCommunities(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      console.log('Search query received:', query); // Ajout de log pour déboguer
      
      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Paramètre de recherche requis'
        });
        return;
      }
      
      const communities = await communityService.searchCommunities(query);
      console.log('Search results:', communities.length); // Ajout de log pour déboguer
      
      res.status(200).json({
        success: true,
        count: communities.length,
        data: communities
      });
    } catch (error: any) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la recherche des communautés'
      });
    }
  }
}

export default CommunityController;
