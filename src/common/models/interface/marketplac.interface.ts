import mongoose, { Document } from "mongoose";

export interface IMarketplace extends Document {
  title: string;
  description: string;
  price: number;
  duration: string;
  userId: string;
  status: "active" | "pending" | "completed" | "canceled";
  createdAt: Date;
  category: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId[];
}
