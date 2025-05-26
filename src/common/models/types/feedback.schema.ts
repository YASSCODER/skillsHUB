import mongoose from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { Feed } from "../interface/feedback.inteface";

export const FeedbackSchema = new mongoose.Schema<Feed>({
  fullName: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: false },
    timestamp: { type: Date, default: Date.now },
    funActivity: { type: String },
    personalityTraits: {
        openness: { type: Number, default: 0 },
        conscientiousness: { type: Number, default: 0 },
        extraversion: { type: Number, default: 0 },
        agreeableness: { type: Number, default: 0 },
        neuroticism: { type: Number, default: 0 }
      },
      randomUserInfo: { type: String }
});

FeedbackSchema.add(BaseSchema);
export default mongoose.model<Feed>("Feedback", FeedbackSchema);
