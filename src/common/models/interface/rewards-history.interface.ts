import mongoose, { Document } from "mongoose";

export interface IRewardsHistory extends Document {
  user: mongoose.Types.ObjectId;
  type: "EARNED" | "REDEEMED";
  points: number;
  wallet: mongoose.Types.ObjectId;
}
