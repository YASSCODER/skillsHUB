import mongoose, { Schema, Document, model } from "mongoose";
import { ISalon } from "./interface/salon.interface";
import Session from "./session.schema";

type SalonDocument = Document & ISalon;

const SalonSchema = new Schema<SalonDocument>({
  nom: { type: String, required: true },
  description: { type: String },
  dateCreation: { type: Date, default: Date.now },
  createurId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

// Suppression en cascade des sessions liées
SalonSchema.pre("findOneAndDelete", async function (next) {
  const salon = await this.model.findOne(this.getFilter());
  if (salon) {
    await Session.deleteMany({ salonId: salon._id });
  }
  next();
});

const Salon = model<SalonDocument>("Salon", SalonSchema);

export default Salon;
export type { SalonDocument };
