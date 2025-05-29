import mongoose, { Schema, Document, Types } from "mongoose";

export interface IScore {
  userId: Types.ObjectId;
  score: number;
  date: Date;
}


export interface IChallenge extends Document {

  id: string;
  title: string;
  description: string;
  skill: mongoose.Types.ObjectId;
  difficulty: "easy" | "medium" | "hard";
  startDate: Date;
  scores: IScore[];
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;


}