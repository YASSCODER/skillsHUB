import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "../base-model.schema";
export const SkillsSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

SkillsSchema.add(BaseSchema);

export default mongoose.model("Skills", SkillsSchema);
