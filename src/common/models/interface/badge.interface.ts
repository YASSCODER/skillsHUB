import mongoose, { Schema, Document } from "mongoose";
import { BadgeEnum } from "../../enum/badge.enum";

export interface IBadge extends Document {
  userId: string;
  challengeId: string;
  name: string;
  type: BadgeEnum;
  percentage: number;  
  totalPercentage: number; 
  awardedAt: Date;
}