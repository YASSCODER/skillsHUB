import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IReactions {
  like: string[];
  success: string[];
  love: string[];
}

export interface ICommentaire {
  auteur: string;
  texte: string;
  date: Date;
  reactions?: IReactions; // Ajout des réactions
  _id?: string;
}

export interface IDocument extends MongooseDocument {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  salonId: mongoose.Types.ObjectId;
  commentaires: ICommentaire[] | undefined;
  etoiles: number;
  type?: 'pdf' | 'video' | 'image'; // Ajout du type image
}

const ReactionsSchema = new Schema({
  like:    { type: [String], default: [] },
  success: { type: [String], default: [] },
  love:    { type: [String], default: [] }
}, { _id: false });

const CommentaireSchema = new Schema({
  auteur: { type: String, required: true },
  texte:  { type: String, required: true },
  date:   { type: Date, default: Date.now },
  reactions: { type: ReactionsSchema, default: () => ({}) }
}, { _id: true });

const DocumentSchema = new Schema<IDocument>({
  filename: { type: String, required: true },
  originalname: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  url: { type: String, required: true },
  salonId: { type: Schema.Types.ObjectId, ref: "Salon", required: false },
  commentaires: { type: [CommentaireSchema], default: [] },
  etoiles: { type: Number, default: 0 },
  type: { type: String, enum: ['pdf', 'video', 'image'], default: 'pdf' }
});

export default mongoose.model<IDocument>("Document", DocumentSchema);
