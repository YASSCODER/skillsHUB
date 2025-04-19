import mongoose from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { IBadge } from "../interface/badge.interface";
import { BadgeEnum } from "../../enum/badge.enum";

export const BadgeSchema = new mongoose.Schema<IBadge>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challengeId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(BadgeEnum), required: true },
  percentage: { type: Number, required: true },
  totalPercentage: { type: Number, required: true },
  awardedAt: { type: Date, default: Date.now },
  imageUrl: { type: String },
}, { timestamps: true }); // <-- ICI

BadgeSchema.add(BaseSchema);
export default mongoose.model<IBadge>("Badge", BadgeSchema);
