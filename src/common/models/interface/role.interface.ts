import mongoose, { Document } from "mongoose";
import { RoleEnum } from "../../enum/role.enum";

export interface IRole extends Document {
  title: RoleEnum;
  users: mongoose.Types.ObjectId[];
}
