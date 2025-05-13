import mongoose from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { ICommunity } from "../interface/community.interface";

const CommunitySchema = new mongoose.Schema<ICommunity>({
  name: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  forums: [{ type: mongoose.Schema.Types.ObjectId, ref: "Forum" }],
});

CommunitySchema.add(BaseSchema);

const Community = mongoose.models.Community || mongoose.model<ICommunity>("Community", CommunitySchema);

export default Community;
