import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "../base-model.schema";

export const SalonSchema: Schema = new Schema(
  {
    nom: { type: String, required: true },
    description: { type: String },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Session" }],
    isPublic: { type: Boolean, default: true },
    tags: [{ type: String }],
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skills" },
  },
  { timestamps: true }
);

SalonSchema.add(BaseSchema);

export default mongoose.model("Salon", SalonSchema);

