  import mongoose, { Schema } from "mongoose";
  import { BaseSchema } from "../base-model.schema";
  import { IChallenge } from "../interface/challenge.interface";

  const ScoreSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    date: { type: Date, default: Date.now }
  });

  const QuestionSchema = new Schema({
    question: String,
    correct_answer: String,
    incorrect_answers: [String],
    category: String,
    type: String,
    difficulty: String
  });

  export const ChallengeSchema = new mongoose.Schema<IChallenge>({
      title: { type: String, required: true },
      description: { type: String, required: true },
      skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", default: null },
      difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
      startDate: { type: Date, required: true },
      scores: { type: [ScoreSchema], default: [] }, 
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 🆕 Ajout de la relation
      questions: { type: [QuestionSchema], default: [] } // 🆕 Ajouté ici
    }, { timestamps: true });

  ChallengeSchema.add(BaseSchema);
  export default mongoose.model<IChallenge>("Challenge", ChallengeSchema);