import mongoose, { Document } from "mongoose";

export interface IComment extends Document {
  body: string;  // Le contenu du commentaire
  author: mongoose.Types.ObjectId;  // Référence à l'utilisateur (un seul auteur)
  forum: mongoose.Types.ObjectId;  // Référence au forum auquel appartient le commentaire
}
