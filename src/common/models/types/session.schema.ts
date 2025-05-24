import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "../base-model.schema";

export const SessionSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  duration: { type: Number, required: true }, // durée en minutes
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
    required: true,
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skills" }, // Ajout du skillId
});

SessionSchema.add(BaseSchema);

export default mongoose.model("Session", SessionSchema);
