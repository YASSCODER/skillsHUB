import { Request, Response } from "express";
import CategoryService from "./Category.service"
import CategorySchema from "../../../common/models/types/category.schema";
class CategoryController {

static async getAllCategory(req: Request, res: Response) {
    try {
      const Category = await CategoryService.getAllCategory();
      res.json(Category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Category" });
    }
  }
   /*
static async getAllCategory() {
    try {
      const categories = await CategorySchema.find(); // Vérifie que cette requête fonctionne
      if (!categories || categories.length === 0) {
        throw new Error("No categories found");  // Ajout d'une vérification si aucune catégorie n'est trouvée
      }
      return categories;
    } catch (error) {
      throw new Error("Error fetching categories");
    }
  }
     */
  static async getCategoryById(req: Request, res: Response) {
    try {
      const Category = await CategoryService.getCategoryById(req.params.id);
      if (!Category) return res.status(404).json({ error: "Category not found" });
      res.json(Category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Category" });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const newCategory = await CategoryService.createCategory(req.body);
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ error: "Failed to create Category" });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const updatedCategory = await CategoryService.updateCategory(req.params.id, req.body);
      if (!updatedCategory)
        return res.status(404).json({ error: "Category not found" });
      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ error: "Failed to update Category" });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const deletedCategory = await CategoryService.deleteCategory(req.params.id);
      if (!deletedCategory)
        return res.status(404).json({ error: "Category not found" });
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete Category" });
    }
  }


}

export default CategoryController;
