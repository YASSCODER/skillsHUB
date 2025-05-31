import mongoose, { Schema, Document } from "mongoose";
import { RoleEnum } from "../../../common/enum/role.enum";
import { BaseSchema } from "../base-model.schema";
import { IUser } from "../interface/user.interface";

const UserSchema: Schema = new Schema<IUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  userRole: { type: String, enum: Object.values(RoleEnum), required: false },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
    default: "67dea9f480ccdc88548f99e7", // Default CLIENT role ObjectId
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
  github: {
    username: String,
    validatedSkills: [
      {
        name: String,
        reposCount: { type: Number, default: 1 },
        lastUsed: { type: Date, default: Date.now },
      },
    ],
    lastUpdated: Date,
  },
  challenges: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", default: [] },
  ],
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge", default: [] }],
  feedback: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Feedback", default: [] },
  ],
  resetToken: { type: String, default: null },
  resetTokenExpiresAt: { type: Number, default: null },
});

// Pre-save middleware to handle role validation issues
UserSchema.pre("save", function (next) {
  // Fix role field if it's a string instead of ObjectId
  if (this.role && typeof this.role === "string") {
    if (this.role === "CLIENT" || this.role === RoleEnum.CLIENT) {
      this.role = new mongoose.Types.ObjectId("67dea9f480ccdc88548f99e7");
    } else if (this.role === "ADMIN" || this.role === RoleEnum.ADMIN) {
      // You may need to update this with the actual admin role ObjectId
      this.role = new mongoose.Types.ObjectId("67dea9f480ccdc88548f99e7"); // Update with actual admin ID
    }
  }
  next();
});

UserSchema.add(BaseSchema);

export default mongoose.model<IUser>("User", UserSchema);
