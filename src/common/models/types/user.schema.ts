import mongoose, { Schema, Document } from "mongoose";
import { RoleEnum } from "../../../common/enum/role.enum";
import { BaseSchema } from "../base-model.schema";
import { IUser } from "../interface/user.interface";

const UserSchema: Schema = new Schema<IUser>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true, default: RoleEnum.CLIENT,},
  wallet: {
    type: mongoose.Schema.Types.ObjectId, ref: "Wallet",default: null,},
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill", default: [] }],
  communities: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Community", default: [] },],
  
    challenges: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", default: [] }, ],
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge", default: [] }],
  feedback: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Feedback", default: [] },],
  resetToken: { type: String, default: null },
  resetTokenExpiresAt: { type: Number, default: null },

  //le: {type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true, default: new mongoose.Types.ObjectId("67dea9f480ccdc88548f99e7"), },

  github: {
    username: String,
    validatedSkills: [{
      name: String,
      reposCount: { type: Number, default: 1 },
      lastUsed: { type: Date, default: Date.now }
    }],
    lastUpdated: Date
  }
},
{ timestamps: true }
);
// Méthode simplifiée (sans dépendance directe à GitHubService)
UserSchema.methods.updateGitHubData = function(githubData: {
  username: string;
  skills: { name: string; reposCount: number }[]
}) {
  this.github = {
    username: githubData.username,
    validatedSkills: githubData.skills,
    lastUpdated: new Date()
  };
  return this;
};
//UserSchema.add(BaseSchema);

export default mongoose.model<IUser>("User", UserSchema);


