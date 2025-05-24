import mongoose, { Document } from "mongoose";

export interface ICommunity extends Document {
  name: string;
  description?: string;
  creator: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  forums: mongoose.Types.ObjectId[];
  events: mongoose.Types.ObjectId[];
}
