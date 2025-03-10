import mongoose, { Document } from "mongoose";

export interface IChat extends Document {
  name: string;
  description: string;
  skills: mongoose.Types.ObjectId[];
}