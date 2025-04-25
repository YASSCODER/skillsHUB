import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { ICommunity } from "../interface/community.interface";

const CommunitySchema: Schema = new Schema<ICommunity>({
  name: { type: String, required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  forums: [{ type: mongoose.Schema.Types.ObjectId, ref: "Forum" }],
});

CommunitySchema.add(BaseSchema);

export default mongoose.model<ICommunity>("Community", CommunitySchema);