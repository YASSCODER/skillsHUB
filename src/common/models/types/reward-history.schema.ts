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
});

RewardsHistorySchema.add(BaseSchema);

export default mongoose.model<IRewardsHistory>("RewardsHistory", RewardsHistorySchema);
