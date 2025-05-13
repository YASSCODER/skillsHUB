import mongoose from "mongoose";
import { BaseSchema } from "../base-model.schema"; // Vérifier que ce fichier est correct et inclut les bonnes propriétés
import { IComment } from "../interface/comment.interface";

// Définition du schéma pour `Comment`
const CommentSchema = new mongoose.Schema<IComment>({
  body: { type: String, required: true },  // `body` au lieu de `content` ou autre
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",  // Lien vers le modèle `User`
    required: true 
  },
  forum: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Forum", 
    required: true 
  },
});

// Ajout de `BaseSchema` si nécessaire, s'il contient des champs génériques
CommentSchema.add(BaseSchema);

const Comment = mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
