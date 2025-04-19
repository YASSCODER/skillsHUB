import mongoose from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { IChallenge } from "../interface/challenge.interface";

export const ChallengeSchema = new mongoose.Schema<IChallenge>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", default: null },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    startDate: { type: Date, required: true },
  }, { timestamps: true });

ChallengeSchema.add(BaseSchema);
export default mongoose.model<IChallenge>("Challenge", ChallengeSchema);