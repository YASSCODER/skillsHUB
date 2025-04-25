import SkillsSchema from "../../../common/models/types/skills.schema";
import UserModel from "../../../common/models/types/user.schema";
import CategorySchema from "../../../common/models/types/category.schema";
import mongoose from "mongoose";
import {ISkill} from "../../../common/models/interface/skills.interface";

class MarketplaceService {
  static async createSkill(skillData: any) {
    // 1. Vérifier que l'ID de la catégorie existe
    const categoryExists = await CategorySchema.findById(skillData.category);
    if (!categoryExists) {
      throw new Error("Category not found");
    }
      // 2. Vérifier que l'utilisateur existe
    const user = await UserModel.findById(skillData.userId);
    if (!user) {
      throw new Error("User not found");
    }
      // 3. Créer le skill (liaison avec la catégorie + userId)
    const newSkill = await SkillsSchema.create({
      name: skillData.name,
      category: skillData.category,
      userId: skillData.userId,
      users: skillData.users
    });
      // 4. Mettre à jour l'utilisateur avec le nouveau skill
    user.skills.push(newSkill._id as mongoose.Types.ObjectId);
    await user.save();
   // 5. Mettre à jour la catégorie avec le nouveau skill
   await CategorySchema.findByIdAndUpdate(
    skillData.category,
    { $addToSet: { skills: newSkill._id } }
  );
    return newSkill;
  }  
    static async getAllSkills() 
    {return await SkillsSchema.find(); }
  
    static async getSkillById(id: string) 
    {return await SkillsSchema.findById(id);}

  static async updateSkill(id: string, skillData: any) 
  {return await SkillsSchema.findByIdAndUpdate(id, skillData, { new: true });}

  static async deleteSkill(id: string) 
  {return await SkillsSchema.findByIdAndDelete(id);}

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
