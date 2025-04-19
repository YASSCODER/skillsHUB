// ✅ salon.schema.ts

import mongoose, { Schema, Document, model } from "mongoose";
import { ISalon } from "./interface/salon.interface";

// ✅ Déclaration de l'interface
type SalonDocument = Document & ISalon;

// ✅ Création du schéma
const SalonSchema = new Schema<SalonDocument>({
  nom: { type: String, required: true },
  description: { type: String },
  dateCreation: { type: Date, default: Date.now },
  createurId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

// ✅ Modèle mongoose
const Salon = model<SalonDocument>("Salon", SalonSchema);

// ✅ Exportations
export default Salon;
export type { SalonDocument }; // 🟢 C'est ça qui permet l'import nommé !
