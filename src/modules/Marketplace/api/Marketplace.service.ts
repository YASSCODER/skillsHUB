import SkillsSchema from "../../../common/models/types/skills.schema";
import UserModel from "../../../common/models/types/user.schema";
import CategorySchema from "../../../common/models/types/category.schema";
import mongoose from "mongoose";
import {ISkill} from "../../../common/models/interface/skills.interface";

class MarketplaceService {
   static async createSkill(skillData: any) {
    try {
      // 🔍 Vérifier et récupérer la catégorie
      let categoryId = skillData.category;

      if (
        typeof categoryId === 'string' &&
        !mongoose.Types.ObjectId.isValid(categoryId)
      ) {
        const category = await CategorySchema.findOne({ name: categoryId });
        if (!category) {
          throw new Error(`Category not found with name: ${categoryId}`);
        }
        categoryId = category._id;
      }

      // ✅ Extraire correctement l'ID utilisateur
      const userId =
        typeof skillData.user === 'string'
          ? skillData.user
          : skillData.user?._id;

      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error(`Invalid user ID: ${userId}`);
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error(`User not found with ID: ${userId}`);
      }

      // 🛠️ Créer le skill
      const newSkill = await SkillsSchema.create({
        name: skillData.name,
        description:
          skillData.description || `Compétence en ${skillData.name}`,
        category: categoryId,
        userId: userId,
        users: skillData.users || [userId],
      });

      // 🔗 Associer le skill à l'utilisateur
      user.skills.push(newSkill._id as mongoose.Types.ObjectId);
      await user.save();

      // 🔗 Associer le skill à la catégorie
      await CategorySchema.findByIdAndUpdate(categoryId, {
        $addToSet: { skills: newSkill._id },
      });

      return newSkill;
    } catch (error) {
      console.error('Error creating skill:', error);
      throw error;
    }
  }
  /*  static async getAllSkills()
    {return await SkillsSchema.find(); }
    */

static async getAllSkills() {
  const skills = await SkillsSchema.find()
    .populate("category", "name")
    .populate("userId", "fullName"); // on recupere fullName de user

  // Remapper userId a user
  const remappedSkills = skills.map(skill => {
    const skillObj = skill.toObject();
    skillObj.user = skillObj.userId; // remap userId to user
    delete skillObj.userId;
    return skillObj;
  });

  return remappedSkills;
}
static async getSkillById(id: string) {
  const skill = await SkillsSchema.findById(id)
    .populate('category', 'name')       // Récupère uniquement le nom de la catégorie
    .populate('userId');                // Récupère toutes les données de l'utilisateur

  if (!skill) {
    throw new Error(`Skill not found with ID: ${id}`);
  }

  // Optionnel : renommer userId → user (comme dans getAllSkills)
  const skillObj = skill.toObject();
  skillObj.user = skillObj.userId;
  delete skillObj.userId;

  return skillObj;
}

    /*
    Error while loading skill details: Http failure response for http://localhost:3000/api/skill-market/skills/68037a18bdd7657dd7b82aa1: 500 Internal Server Error


    static async getSkillById(id: string)
    {return await SkillsSchema.findById(id);}

  static async updateSkill(id: string, skillData: any)
  {return await SkillsSchema.findByIdAndUpdate(id, skillData, { new: true });}
*/
  static async deleteSkill(id: string)
  {return await SkillsSchema.findByIdAndDelete(id);}

  static async updateSkill(id: string, skillData: any) {
    try {
      // 1. Vérifier que le skill existe
      const existingSkill = await SkillsSchema.findById(id);
      if (!existingSkill) {
        throw new Error(`Skill not found with ID: ${id}`);
      }

      // 2. Vérifier que la nouvelle catégorie existe (si modifiée)
      if (skillData.category) {
        // Vérifier si la catégorie est un nom plutôt qu'un ID
        let categoryId = skillData.category;
        if (typeof categoryId === 'string' && !mongoose.Types.ObjectId.isValid(categoryId)) {
          const categoryByName = await CategorySchema.findOne({ 
            name: { $regex: new RegExp(`^${categoryId}$`, 'i') } 
          });
          
          if (categoryByName) {
            categoryId = categoryByName._id;
            skillData.category = categoryId;
          } else {
            throw new Error(`Category not found: ${categoryId}`);
          }
        } else {
          const categoryExists = await CategorySchema.findById(categoryId);
          if (!categoryExists) {
            throw new Error(`Category not found with ID: ${categoryId}`);
          }
        }
      }

      // 3. Vérifier que le nouvel utilisateur existe (si modifié)
      if (skillData.userId) {
        const user = await UserModel.findById(skillData.userId);
        if (!user) {
          throw new Error(`User not found with ID: ${skillData.userId}`);
        }

        // Convertir l'ID du skill en ObjectId
        const skillObjectId = new mongoose.Types.ObjectId(id);

        // Ajouter le skill à l'utilisateur s'il ne l'a pas déjà
        if (!user.skills.some(skill => skill.equals(skillObjectId))) {
          user.skills.push(skillObjectId);
          await user.save();
        }
      }

      // 4. Mettre à jour le skill
      const updatedSkill = await SkillsSchema.findByIdAndUpdate(id, skillData, { new: true });

      // 5. Mettre à jour la catégorie avec le skill (si changée)
      if (skillData.category) {
        await CategorySchema.findByIdAndUpdate(
          skillData.category,
          { $addToSet: { skills: new mongoose.Types.ObjectId(id) } }
        );
      }

      return updatedSkill;
    } catch (error) {
      console.error("Error in updateSkill service:", error);
      throw error; // Propager l'erreur pour la gérer dans le contrôleur
    }
  }
  static async getSkillsByCategory(categoryId: string) {
    // Vérifier que la catégorie existe
    const categoryExists = await CategorySchema.findById(categoryId);
    if (!categoryExists) {
      throw new Error("Category inexistante");
    }

    // Récupérer les skills de cette catégorie
    const skills = await SkillsSchema.find({ category: categoryId })
      .populate('users', 'fullName email') // Peupler les infos des utilisateurs
      .populate('category', 'name'); // Peupler le nom de la catégorie

    return skills;
  }
  static async matchingSkills(userId: string) {
    // 1. Récupérer les compétences (skills) du user courant avec leurs noms
    const currentUser = await UserModel.findById(userId)
      .populate({
        path: "skills",
        select: "name description"
      })
      .select("skills");

    if (!currentUser) {
      throw new Error("Utilisateur introuvable");
    }

    // Vérifier si l'utilisateur a des compétences
    if (!currentUser.skills || currentUser.skills.length === 0) {
      console.log("L'utilisateur n'a pas de compétences");
      return [];
    }

    // Extraire les noms des compétences (en minuscules pour éviter les problèmes de casse)
    const currentSkillNames = currentUser.skills.map((skill: any) =>
      skill.name ? skill.name.toLowerCase() : null
    ).filter(name => name !== null);

    console.log("Compétences de l'utilisateur courant:", currentSkillNames);

    // 2. Récupérer tous les autres utilisateurs avec leurs compétences
    const otherUsers = await UserModel.find({ _id: { $ne: userId } })
      .populate({
        path: "skills",
        select: "name description"
      })
      .select("fullName email skills");

    console.log(`Nombre d'autres utilisateurs trouvés: ${otherUsers.length}`);

    // 3. Filtrer les utilisateurs qui ont au moins un skill avec le même nom
    const usersWithCommonSkills = otherUsers.map((user) => {
      // Vérifier si l'utilisateur a des compétences
      if (!user.skills || user.skills.length === 0) {
        return {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          commonSkills: [],
          commonCount: 0
        };
      }

      const commonSkills = user.skills.filter((skill: any) => {
        // Vérifier si le skill a un nom
        if (!skill || !skill.name) return false;

        // Comparer les noms en minuscules pour éviter les problèmes de casse
        return currentSkillNames.includes(skill.name.toLowerCase());
      });

      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        commonSkills,
        commonCount: commonSkills.length,
      };
    }).filter(user => user.commonCount > 0); // ne garder que les users avec des skills communs

    console.log(`Nombre d'utilisateurs avec des compétences communes: ${usersWithCommonSkills.length}`);

    return usersWithCommonSkills;
  }

  /*
  static async matchingSkills(userId: string) {
  // recuperer user courant par id uniquement les skills
  const currentUser = await UserModel.findById(userId).select("skills");
  if (!currentUser) {
    // Si aucun user
    throw new Error("Utilisateur introuvable");
  }
  //convertion des ObjectId en chaînes de caractères pour simplifier les comparaisons
  const currentSkills = currentUser.skills.map((skillId: mongoose.Types.ObjectId) =>
    skillId.toString()
  );
  //chercher les users qui ont des skills comme user courant
  const otherUsers = await UserModel.find({
    _id: { $ne: userId }, //$ne operateur mongodb pour exclure le user lui-même
    skills: { $in: currentSkills }, // $in appartient a;skill en commun
  })
    .populate("skills", "name") //On récupère le nom de chaque skill (pour affichage)
    .select("fullName email skills"); // recuperer les donnees du user
  //traitement des users trouvé
  const usersWithCommonSkills = otherUsers.map((user) => {
    //convertion des compétences en string pour comparaison
    const userSkills = user.skills.map((skill: any) => skill._id.toString());

    //enregistré seuelement les compétences communes entre le user courant et l autre
    const commonSkills = user.skills.filter((skill: any) =>
      currentSkills.includes(skill._id.toString())
    );
    //retour des infos avec les skills partagées et leur nombre
    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      commonSkills, //liste des compétences partagées avec le user courant
      commonCount: commonSkills.length, // Nombre total de compétences partagées
    };
  });

  //retour de la liste finale des users avec leurs skill communs
  return usersWithCommonSkills;
  }
*/


  static async findUsersWithSkill(skillname: string) {
    // Recherche de l'ID du skill par son nom
    const skill = await SkillsSchema.findOne({
      name: { $regex: new RegExp(`^${skillname}$`, "i") }, // "i" pour insensible à la casse
    });
    if (!skill) {
      throw new Error(`Skill '${skillname}' not found`);  // Si le skill n'est pas trouvé, on lève une erreur
    }

    // Recherche des utilisateurs ayant cet skill dans leur tableau 'skills'
    const usersWithSkill = await UserModel.find({
      skills: skill._id,  // On filtre les utilisateurs qui ont cet skill
    }).select("fullName email skills");  // On récupère seulement les informations nécessaires

    return usersWithSkill;  // On renvoie les utilisateurs trouvés
  }


}

export default MarketplaceService;
/*
// les compétences filtre
static async getSkillsByFilterService(filters: { userId?: string; category?: string; skill?: string }) {
  const { userId, category, skill } = filters;
  let filter: any = {};
  // Construction dynamique du filtre
  if (userId) filter.userId = userId;
  if (category) filter.category = category;
  if (skill) filter.name = { $regex: skill, $options: 'i' };  // Recherche insensible à la casse
  try {
    console.log("=== Filtres reçus ===", filters); //  à l'intérieur du try
    // Recherche dans la base de données
    const skills = await SkillsSchema.find(filter)
      .populate("userId", "name email")  // Récupérer les infos du user
      .populate("category", "name")      // Récupérer le nom de la catégorie
      .populate("users", "name email")  // Récupérer les utilisateurs associés à ce skill
     return skills;
  } catch (error) {
    console.error("Erreur dans la récupération des compétences :", error);
    throw new Error("Failed to fetch skills");
  }
}




  static async getSkillsByFilterService(filters: any) {
    const { userId, category, skill } = filters;
    let filter: any = {};

    if (userId) filter.userId = userId;
    if (category) filter.category = category;
    if (skill) filter.skillsRequired = { $in: [skill] };

    const skills = await SkillsSchema.find(filter)
      .populate("userId", "name email")  // Récupérer les infos du user
      .populate("category", "name")      // Récupérer le nom de la catégorie
      .populate("skillsRequired", "name"); // Récupérer les skills associées

    return skills;
  }
  */
