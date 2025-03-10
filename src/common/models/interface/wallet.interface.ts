import mongoose, { Document } from "mongoose";

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId;
  imoney: mongoose.Types.ObjectId;
}
