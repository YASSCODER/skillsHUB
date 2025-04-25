import mongoose, { Schema, Document } from "mongoose";
import { ICommunity } from "./interface/community.interface";
import { BaseSchema } from "./base-model.schema"; // ajuste le chemin si besoin

const CommunitySchema = new Schema<ICommunity>(
  {
    name: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    forums: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Forum" },
    ],
    events: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    ],
  },
  {
    timestamps: true,  // Pour avoir les champs createdAt et updatedAt
  }
);

// Évite OverwriteModelError
const CommunityModel = mongoose.models.Community || mongoose.model<ICommunity>("Community", CommunitySchema);

export { CommunityModel };
 mongoose.models.Community || mongoose.model<ICommunity>("Community", CommunitySchema);
