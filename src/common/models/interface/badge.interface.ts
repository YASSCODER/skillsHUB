import mongoose, { Schema, Document } from "mongoose";
import { BadgeEnum } from "../../enum/badge.enum";

export interface IBadge extends Document {
  userId: any;
  user: mongoose.Types.ObjectId[];
  challengeId: string;
  name: string;
  type: BadgeEnum;
  percentage: number;
  totalPercentage: number;
  awardedAt: Date;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
