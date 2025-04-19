import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: mongoose.Types.ObjectId;
  wallet: mongoose.Types.ObjectId;
  skills: mongoose.Types.ObjectId[];
  communities: mongoose.Types.ObjectId[];
  challenges: mongoose.Types.ObjectId[];
  badges: mongoose.Types.ObjectId[];
  feedback: mongoose.Types.ObjectId[];
}
