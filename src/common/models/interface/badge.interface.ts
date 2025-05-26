import mongoose, { Schema, Document } from "mongoose";
import { BadgeEnum } from "../../enum/badge.enum";

export interface IBadge extends Document {
  userId: any;
  user: mongoose.Types.ObjectId[];
  challengeId: mongoose.Types.ObjectId;
  name: string;
  type: BadgeEnum;
  percentage: number;
  totalPercentage: number;
  awardedAt: Date;
  imageUrl?: string;
  certificateImageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
