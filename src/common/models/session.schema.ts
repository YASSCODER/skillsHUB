import mongoose, { Schema, Document, model } from "mongoose";
import { ISession } from "./interface/session.interface";

// ✅ Alias pour Document
export type SessionDocument = Document & ISession;

const SessionSchema = new Schema<SessionDocument>(
  {
    salonId: { type: Schema.Types.ObjectId, ref: "Salon", required: true },
    type: { type: String, enum: ["chat", "meet"], required: true },
    dateDebut: { 
      type: Date, 
      required: true,
      validate: {
        validator: function (value: Date) {
          return !isNaN(value.getTime()); // Vérifie que la date est valide
        },
        message: "Le format de la dateDebut est invalide."
      }
    },
    dateFin: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: SessionDocument, value: Date) {
          return value > this.dateDebut;
        },
        message: "La date de fin doit être après la date de début.",
      },
    },
    createurNom: { type: String, required: true },
    etat: { type: String, enum: ["active", "terminée", "en attente"], default: "en attente" },
  },
  { timestamps: true }
);

// ✅ Modèle mongoose
const Session = model<SessionDocument>("Session", SessionSchema);

// ✅ Export
export default Session;