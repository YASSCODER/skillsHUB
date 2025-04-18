import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { IRewards } from "../interface/rewards.interface";

const RewardsSchema: Schema = new Schema<IRewards>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, unique: true
    },
    points: { type: Number, required: true, default: 0 },
    redeemed: { type: Number, default: 0 },
});

RewardsSchema.add(BaseSchema);

export default mongoose.model<IRewards>("Rewards", RewardsSchema);
