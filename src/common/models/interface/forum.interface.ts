import mongoose, { Document } from "mongoose";
export interface IForum extends Document {
  title: string;
  author: mongoose.Types.ObjectId;
  content: string;
  comments: mongoose.Types.ObjectId[];
  community: mongoose.Types.ObjectId;
  ratings: {
    user: mongoose.Types.ObjectId;
    score: number;
  }[];
}
