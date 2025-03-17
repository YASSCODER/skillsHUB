import mongoose, { Document } from "mongoose";

export interface Feed extends Document {
  id: string,
  userId: mongoose.Schema.Types.ObjectId,
  targetUserId: mongoose.Schema.Types.ObjectId, 
  rating: Number,
  comment: String,
  timestamp: Date
}
