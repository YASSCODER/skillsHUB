import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { IRewardsHistory } from "../interface/rewards-history.interface";

const RewardsHistorySchema: Schema = new Schema<IRewardsHistory>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: { type: String, enum: ["EARNED", "REDEEMED"], required: true },
  points: { type: Number, required: true },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true
  },
  source: {
    type: String,
    enum: ["wallet_topup", "skill_purchase", "challenge_purchase", "manual", "points_to_imoney"],
    default: "manual"
  },
  description: { type: String },
  relatedId: { type: String }, // For storing transaction IDs, skill IDs, etc.
});

RewardsHistorySchema.add(BaseSchema);

export default mongoose.model<IRewardsHistory>("RewardsHistory", RewardsHistorySchema);
