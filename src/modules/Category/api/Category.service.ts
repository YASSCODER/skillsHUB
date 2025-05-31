import CategorySchema from "../../../common/models/types/category.schema";

class CategoryService {
  static async getAllCategory() {
    return await CategorySchema.find();
  }
  
  static async getCategoryById(id: string) {
    return await CategorySchema.findById(id);
  }

  static async createCategory(CategoryData: any) {
    return await CategorySchema.create(CategoryData);
  }

  static async updateCategory(id: string, CategoryData: any) {
    return await CategorySchema.findByIdAndUpdate(id, CategoryData, { new: true });
  } 

  static async deleteCategory(id: string) {
    return await CategorySchema.findByIdAndDelete(id);
  }
}

export default CategoryService;
