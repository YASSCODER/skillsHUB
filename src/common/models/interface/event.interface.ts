import mongoose, { Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  location: string;
  date: Date;
  creator: mongoose.ObjectId;

  community: mongoose.ObjectId;
}
