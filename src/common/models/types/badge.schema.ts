import mongoose from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { IBadge } from "../interface/badge.interface";
import { BadgeEnum } from "../../enum/badge.enum";

export const BadgeSchema = new mongoose.Schema<IBadge>({
  userId: { type: String, required: true },
  challengeId: { type: String, required: true },
  name: { type: String, required: true, default:BadgeEnum.PARTICIPANT },
  awardedAt: { type: Date, default: Date.now },
});

BadgeSchema.add(BaseSchema);
export default mongoose.model<IBadge>("Badge", BadgeSchema);