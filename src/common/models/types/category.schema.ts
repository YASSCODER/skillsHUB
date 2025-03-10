import mongoose from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { ICategory } from "../interface/category.interface";

export const CategorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skills" }],
});

CategorySchema.add(BaseSchema);
export default mongoose.model<ICategory>("Category", CategorySchema);
