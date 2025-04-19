import mongoose, { Schema, Document } from "mongoose";

export interface IChallenge extends Document {
  id: string;
  title: string;
  description: string;
  skill: string; 
  difficulty: "easy" | "medium" | "hard";
  createdAt: Date;
}