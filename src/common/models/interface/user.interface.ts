import mongoose, { Document } from "mongoose";
import { RoleEnum } from "../../enum/role.enum";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: mongoose.Types.ObjectId;
  wallet: mongoose.Types.ObjectId;
  skills: mongoose.Types.ObjectId[];
  communities: mongoose.Types.ObjectId[];
}
