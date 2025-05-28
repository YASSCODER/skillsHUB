import mongoose, { Document } from "mongoose";

export interface ISkill extends Document {
  name: string;
  description: string;
  category: mongoose.Types.ObjectId;
  users: mongoose.Types.ObjectId[];
  userId: mongoose.Types.ObjectId;
  valeur:Float64Array;
  createdAt?: Date;
}
