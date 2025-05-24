import { Document, Types } from "mongoose";

export interface ISession extends Document {
  salonId: Types.ObjectId;
  type: "chat" | "meet";
  dateDebut: Date;
  dateFin: Date;
  createurNom: string;
  etat: "active" | "terminée" | "en attente";
}
