import mongoose, { Schema, Document } from "mongoose";

export interface ISessionMessage extends Document {
  sessionId: string;
  user: string;
  message: string;
  timestamp: Date;
}

const SessionMessageSchema: Schema = new Schema({
  sessionId: { type: String, required: true },
  user: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<ISessionMessage>("SessionMessage", SessionMessageSchema);