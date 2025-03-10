import mongoose, { Document } from "mongoose";

export interface ISkill extends Document {
  name: string;
  category: mongoose.Types.ObjectId;
  users: mongoose.Types.ObjectId[];
}
