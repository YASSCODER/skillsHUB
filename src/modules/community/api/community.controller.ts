import { Request, Response } from "express";
import communityService from "./community.service";
import { CommunityModel } from "../../../common/models/community.model";
import Community from "../../../common/models/types/community.schema";

class CommunityController {
  // ✅ Créer une communauté
  static async createCommunity(req: Request, res: Response): Promise<void> {
    try {
      console.log("Creating community with data:", req.body);

      // Commentez temporairement la vérification d'authentification pour les tests
      /*
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
        return;
      }
      */

      const communityData = req.body;

      // Utilisez un ID de créateur par défaut pour les tests
      communityData.creator = "64f8b8e55a1c9b1c5e8b4567"; // Utilisez un ID valide de votre base de données

      const community = await communityService.createCommunity(communityData);
      console.log("Community created:", community);

      res.status(201).json({
        success: true,
        data: community,
      });
    } catch (error: any) {
      console.error("Error creating community:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Erreur lors de la création de la communauté",
      });
    }
  }

  static async getAllCommunities(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const communities = await communityService.getAllCommunities();
      return res.status(200).json(communities);
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Erreur récupération communautés", details: err });
    }
  }

  // ✅ Récupérer une communauté par son ID
  static async getCommunityById(
    req: Request,
    res: Response
  ): Promise<Response> {
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
      const updatedCommunity = await communityService.updateCommunity(
        id.trim(),
        req.body
      );

      if (!updatedCommunity) {
        return res.status(404).json({ error: "Community not found" });
      }

      return res.json({
        message: "Community updated successfully",
        community: updatedCommunity,
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
      const deletedCommunity = await communityService.deleteCommunity(
        id.trim()
      );

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
      const isMember = await communityService.isUserMember(
        idCommunity.trim(),
        idUser.trim()
      );

      return res.json({ isMember });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to check membership" });
    }
  }

  // ✅ Ajouter un membre à une communauté (nouvelle version améliorée)
  static async addMember(req: Request, res: Response): Promise<void> {
    try {
      const { communityId, userId } = req.params;
      console.log(`Adding member ${userId} to community ${communityId}`);

      // Vérifier que les paramètres sont présents
      if (!communityId || !userId) {
        res.status(400).json({
          success: false,
          message: "ID de communauté ou d'utilisateur manquant",
        });
        return;
      }

      try {
        // Ajouter le membre à la communauté
        const community = await communityService.addMemberToCommunity(
          communityId,
          userId
        );

        res.status(200).json({
          success: true,
          data: community,
        });
      } catch (serviceError: any) {
        // Gérer spécifiquement l'erreur "User is already a member"
        if (serviceError.message === "User is already a member") {
          res.status(409).json({
            // 409 Conflict est approprié ici
            success: false,
            message: "L'utilisateur est déjà membre de cette communauté",
          });
        } else if (serviceError.message === "Community not found") {
          res.status(404).json({
            success: false,
            message: "Communauté non trouvée",
          });
        } else {
          // Relancer l'erreur pour qu'elle soit gérée par le bloc catch externe
          throw serviceError;
        }
      }
    } catch (error: any) {
      console.error("Error adding member:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Erreur lors de l'ajout du membre",
      });
    }
  }

  // ✅ Supprimer un membre d'une communauté (nouvelle version améliorée)
  static async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const { communityId, userId } = req.params;
      console.log(`Removing member ${userId} from community ${communityId}`);

      // Vérifier que les paramètres sont présents
      if (!communityId || !userId) {
        res.status(400).json({
          success: false,
          message: "ID de communauté ou d'utilisateur manquant",
        });
        return;
      }

      // Supprimer le membre de la communauté
      const community = await communityService.removeMemberFromCommunity(
        communityId,
        userId
      );

      if (!community) {
        res.status(404).json({
          success: false,
          message: "Communauté non trouvée",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: community,
      });
    } catch (error: any) {
      console.error("Error removing member:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Erreur lors de la suppression du membre",
      });
    }
  }

  // ✅ Rechercher des communautés
  static async searchCommunities(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      console.log("Search query received:", query); // Ajout de log pour déboguer

      if (!query) {
        res.status(400).json({
          success: false,
          message: "Paramètre de recherche requis",
        });
        return;
      }

      const communities = await communityService.searchCommunities(query);
      console.log("Search results:", communities.length); // Ajout de log pour déboguer

      res.status(200).json({
        success: true,
        count: communities.length,
        data: communities,
      });
    } catch (error: any) {
      console.error("Search error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Erreur lors de la recherche des communautés",
      });
    }
  }

  // ✅ Récupérer les membres d'une communauté
  static async getCommunityMembers(req: Request, res: Response): Promise<void> {
    try {
      const { communityId } = req.params;
      console.log(`Getting members for community ${communityId}`);

      // Vérifier que l'ID de la communauté est présent
      if (!communityId) {
        res.status(400).json({
          success: false,
          message: "ID de communauté manquant",
        });
        return;
      }

      // Récupérer la communauté avec ses membres
      const community = await communityService.getCommunityWithMembers(
        communityId
      );

      if (!community) {
        res.status(404).json({
          success: false,
          message: "Communauté non trouvée",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: community.members,
      });
    } catch (error: any) {
      console.error("Error getting community members:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Erreur lors de la récupération des membres",
      });
    }
  }

  static async countCommunities(req: Request, res: Response) {
    try {
      const result = await communityService.countCommunities();
      res.json(result);
    } catch (error) {
      res.status(404).json({ error: "no community found" });
    }
  }
}

export default CommunityController;
