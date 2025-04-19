import mongoose, { Document } from "mongoose";

export interface IComment extends Document {
      body: string;
      author: mongoose.Types.ObjectId[];
      forum: mongoose.Types.ObjectId[];
}