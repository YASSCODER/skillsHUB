import mongoose, { Schema, Document } from "mongoose";

export interface IChallenge extends Document {

  id: string;
  title: string;
  description: string;
  skill: mongoose.Types.ObjectId; 
  difficulty: "easy" | "medium" | "hard";
  startDate: Date;
  createdAt?: Date;  
  updatedAt?: Date;
}