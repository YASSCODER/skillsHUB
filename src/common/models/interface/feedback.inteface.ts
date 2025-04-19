import mongoose, { Document } from "mongoose";

export interface Feed extends Document {
  userId: mongoose.Schema.Types.ObjectId,
  targetUserId: mongoose.Schema.Types.ObjectId, 
  rating: number,
  comment: string,
  timestamp: Date,
  funActivity?: string,
  personalityTraits?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  randomUserInfo?: string;
}
