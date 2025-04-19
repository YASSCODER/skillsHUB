import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "../base-model.schema"; // Si vous avez un schéma de base avec des champs communs comme `createdAt`, `updatedAt`

export const SalonSchema: Schema = new Schema(
  {
    nom: { type: String, required: true }, // Utilisez 'nom' ici, comme défini dans l'interface ISalon
    description: { type: String },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Session" }],
    isPublic: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true } // Si vous avez des champs `createdAt` et `updatedAt`
);

SalonSchema.add(BaseSchema); // Ajoutez si nécessaire des champs comme `createdAt`, `updatedAt`

export default mongoose.model("Salon", SalonSchema);

