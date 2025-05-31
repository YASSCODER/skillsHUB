import { Request, Response } from "express";
import MarketplaceService from "./Marketplace.service";
import UserModel from "../../../common/models/types/user.schema";
import { GitHubService } from "../api/github.service";
class MarketplaceController {
  static async getAllSkills(req: Request, res: Response) {
    try {
      const Skills = await MarketplaceService.getAllSkills();
      res.json(Skills);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Skills" });
    }
  }

  static async getSkillById(req: Request, res: Response) {
    try {
      const skill = await MarketplaceService.getSkillById(req.params.id);
      if (!skill) return res.status(404).json({ error: "Skill not found" });
      res.json(skill);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Skill" });
    }
  }

  static async createSkill(req: Request, res: Response) {
    try {
      // Log the request body to debug
      console.log("Create skill request body:", req.body);

      const newSkill = await MarketplaceService.createSkill(req.body);
      res.status(201).json(newSkill);
    } catch (error) {
      console.error("CREATE SKILL ERROR:", error);

      // Provide a more specific error message
      let errorMessage = "Failed to create Skill";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      res.status(500).json({ error: errorMessage });
    }
  }

  static async updateSkill(req: Request, res: Response) {
    try {
      console.log("Updating skill with ID:", req.params.id);
      console.log("Update data:", req.body);

      const updatedSkill = await MarketplaceService.updateSkill(
        req.params.id,
        req.body
      );
      if (!updatedSkill)
        return res.status(404).json({ error: "Skill not found" });

      console.log("Skill updated successfully:", updatedSkill);
      res.json(updatedSkill);
    } catch (error) {
      console.error("UPDATE SKILL ERROR:", error);

      // Fournir un message d'erreur plus spécifique
      let errorMessage = "Failed to update Skill";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      res.status(500).json({ error: errorMessage });
    }
  }

  static async deleteSkill(req: Request, res: Response) {
    try {
      const deletedSkill = await MarketplaceService.deleteSkill(req.params.id);
      if (!deletedSkill)
        return res.status(404).json({ error: "Skill not found" });
      res.json({ message: "Skill deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete Skill" });
    }
  }
  static async getSkillsByCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.query;

      if (!categoryId) {
        return res.status(400).json({ error: "categoryId is required" });
      }

      const skills = await MarketplaceService.getSkillsByCategory(
        categoryId as string
      );

      if (!skills.length) {
        return res
          .status(404)
          .json({ error: "No skills found for this category" });
      }

      res.json(skills);
    } catch (error) {
      console.error("GET SKILLS BY CATEGORY ERROR:", error);
      // Solution type-safe
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch skills by category";

      res.status(500).json({ error: errorMessage });
    }
  }
  static async matchSkills(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId requis" });
      }
      console.log("Tentative de matching pour userId:", userId);
      const matches = await MarketplaceService.matchingSkills(userId as string);
      console.log("Matching réussi, résultats:", matches);
      res.json(matches);
    } catch (error) {
      console.error("Erreur matching:", error);
      res
        .status(500)
        .json({ error: "Erreur lors du matching des compétences" });
    }
  }

  /*
  static async matchSkills(req: Request, res: Response) {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId requis" });
    }
    const matches = await MarketplaceService.matchingSkills(userId as string);
    res.json(matches);
  } catch (error) {
    console.error("Erreur matching:", error);
    res.status(500).json({ error: "Erreur lors du matching des compétences" });
  }
}*/
  static async findUsersWithSkill(req: Request, res: Response) {
    try {
      const { skillname } = req.query; // On récupère le nom du skill depuis les paramètres de la requête

      if (!skillname) {
        return res.status(400).json({ error: "Skill name is required" }); // Si le nom du skill n'est pas fourni, on retourne une erreur
      }

      // On appelle la méthode du service pour récupérer les utilisateurs avec ce skill
      const usersWithSkill = await MarketplaceService.findUsersWithSkill(
        skillname as string
      );

      // Si aucun utilisateur n'est trouvé
      if (!usersWithSkill.length) {
        return res
          .status(404)
          .json({ error: `No users found with skill '${skillname}'` });
      }

      // Si des utilisateurs sont trouvés, on les renvoie
      res.status(200).json(usersWithSkill);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch users with skill" });
    }
  }
  //Scanner toutes les compétences GitHub d'un utilisateur et mettre à jour directement son profil dans la base de données.
  static async verifyGitHubSkills(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { githubUsername } = req.body;

      if (!githubUsername) {
        return res.status(400).json({ error: "GitHub username is required" });
      }

      const user = await UserModel.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const skills = await GitHubService.scanUserSkills(githubUsername);

      // Solution alternative sans méthode d'instance
      user.github = {
        username: githubUsername,
        validatedSkills: skills,
        lastUpdated: new Date(),
      };

      const updatedUser = await user.save();

      res.json({
        message: "GitHub skills updated successfully",
        skills: updatedUser.github?.validatedSkills,
      });
    } catch (error) {
      console.error("GitHub verification error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "GitHub verification failed";
      res.status(500).json({ error: errorMessage });
    }
  }
  //Vérifier une compétence spécifique pour un utilisateur GitHub donné, sans toucher à la base.
  static async checkSkill(req: Request, res: Response) {
    try {
      const { username, skill } = req.query;

      if (!username || !skill) {
        return res
          .status(400)
          .json({ error: "Username and skill parameters are required" });
      }

      const isValid = await GitHubService.validateSkill(
        username as string,
        skill as string
      );
      res.json({ skill, isValid });
    } catch (error) {
      console.error("Skill validation error:", error);
      // Ajoutons un message plus complet pour debugging
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      res.status(500).json({ error: `Skill validation failed: ${message}` });
    }
  }

  static async getSkillsByIds(req: Request, res: Response) {
    try {
      const { ids } = req.query;

      if (!ids) {
        return res.status(400).json({ error: "ids parameter is required" });
      }

      // Handle both array and single string
      const skillIds = Array.isArray(ids) ? ids : [ids];

      console.log("Fetching skills for IDs:", skillIds);

      const skills = await MarketplaceService.getSkillsByIds(
        skillIds as string[]
      );
      res.json(skills);
    } catch (error) {
      console.error("GET SKILLS BY IDS ERROR:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch skills by IDs";
      res.status(500).json({ error: errorMessage });
    }
  }
}

export default MarketplaceController;
/*
  // Méthode pour obtenir les compétences filtrées
  static async getSkillsByFilter(req: Request, res: Response) {
    try {
      const { userId, category, skill } = req.query;
      console.log("Query params reçus :", req.query);
      // Validation des paramètres de requête
      if (!userId && !category && !skill) {
        return res.status(400).json({ message: "Paramètres manquants" });
      }
      const filters = {
        userId: userId as string,
        category: category as string,
        skill: skill as string,
      };
      console.log("Filtres transmis au service :", filters);
      // Appel du service pour récupérer les compétences
      const skills = await MarketplaceService.getSkillsByFilterService(filters);

      // Retourner la réponse
      res.json(skills);
    } catch (error) {
      console.error("Erreur lors de la récupération des compétences:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des compétences." });
    }
  }


//récément ajouté pas encore vérifié
  static async getSkillsByFilter(req: Request, res: Response) {
    try {
      const { userId, category, skill } = req.query;
      let filter: any = {};

      if (userId) filter.userId = userId;
      if (category) filter.category = category;
      if (skill) filter.skillsRequired = { $in: [skill] };

      const Skills = await SkillsSchema.find(filter)
        .populate("userId", "name email")  // Récupérer les infos du user
        .populate("category", "name")  // Récupérer le nom de la catégorie
        .populate("skillsRequired", "name"); // Récupérer les skills associées

      res.json(Skills);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des offres." });
    }
  }
*/
