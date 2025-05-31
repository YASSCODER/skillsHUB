import mongoose, { Document } from "mongoose";
import { RoleEnum } from "../../enum/role.enum";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  userRole: RoleEnum;
  role: mongoose.Types.ObjectId;
  wallet: mongoose.Types.ObjectId;
  skills: mongoose.Types.ObjectId[];
  communities: mongoose.Types.ObjectId[];
  challenges: mongoose.Types.ObjectId[];
  badges: mongoose.Types.ObjectId[];
  feedback: mongoose.Types.ObjectId[];
  resetToken: string;
  resetTokenExpiresAt: number;
  //added by manel
  github?: {
    username: string;
    validatedSkills: {
      name: string;
      reposCount: number;
      lastUsed: Date;
    }[];
    lastUpdated?: Date;
  };
}
