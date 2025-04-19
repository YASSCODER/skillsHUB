import mongoose, { Schema, Document, model } from "mongoose";
import { ISession } from "./interface/session.interface";

// ✅ Alias du type Document
export type SessionDocument = Document & ISession;

// ✅ Schéma mongoose
const SessionSchema = new Schema<SessionDocument>({
  salonId: { type: Schema.Types.ObjectId, ref: "Salon", required: true },
  type: { type: String, enum: ["chat", "meet"], required: true },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  createurId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  etat: { type: String, enum: ["active", "terminée", "en attente"], default: "en attente" },
}, { timestamps: true });

// ✅ Modèle mongoose
const Session = model<SessionDocument>("Session", SessionSchema);

// ✅ Export
export default Session; // <-- Le modèle

