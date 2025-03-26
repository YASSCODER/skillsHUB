import mongoose, { Document } from "mongoose";

export interface IRewards extends Document {
  user: mongoose.Schema.Types.ObjectId;
  points: number;
  redeemed: number;
}
