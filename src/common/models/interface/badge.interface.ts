import mongoose, { Schema, Document } from "mongoose";

export interface IBadge extends Document {
  id: string;
  userId: string;
  challengeId: string;
  name: string; 
  awardedAt: Date;
  level: number;
  experience:number;
}