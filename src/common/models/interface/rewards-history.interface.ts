import mongoose, { Document } from "mongoose";

export interface IRewardsHistory extends Document {
  user: mongoose.Types.ObjectId;
  type: "EARNED" | "REDEEMED";
  points: number;
  wallet: mongoose.Types.ObjectId;
  source?: "wallet_topup" | "skill_purchase" | "challenge_purchase" | "manual" | "points_to_imoney";
  description?: string;
  relatedId?: string;
}
