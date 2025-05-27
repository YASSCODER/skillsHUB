import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { ISkill } from "../interface/skills.interface";
export const SkillsSchema: Schema = new Schema<ISkill>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  valeur: { type: Number, default: 0 },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  imoneyPrice: { type: Number, default: 0 }, // Price in iMoney to purchase this skill
});

SkillsSchema.add(BaseSchema);

export default mongoose.model("Skills", SkillsSchema);
