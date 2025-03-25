import mongoose, { Schema, Document } from "mongoose";
import { RoleEnum } from "../../../common/enum/role.enum";
import { BaseSchema } from "../base-model.schema";
import { IUser } from "../interface/user.interface";

const UserSchema: Schema = new Schema<IUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
    default: RoleEnum.CLIENT,
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    default: null,
  },
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill", default: [] }],
  communities: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Community", default: [] },
  ],
  challenges: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", default: [] },
  ],
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge", default: [] }],
  feedback: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Feedback", default: [] },
  ],
});

UserSchema.add(BaseSchema);

export default mongoose.model<IUser>("User", UserSchema);
