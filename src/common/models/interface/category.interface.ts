import mongoose, { Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description: string;
  skills: mongoose.Types.ObjectId[];
}
