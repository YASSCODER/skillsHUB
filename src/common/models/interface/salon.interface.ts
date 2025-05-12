import { Types } from "mongoose";

export interface ISalon {
  nom: string;
  description?: string;
  dateCreation: Date;
  createurId: Types.ObjectId;
}