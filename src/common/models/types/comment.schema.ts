import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { IComment } from "../interface/comment.interface";

const CommentSchema: Schema = new Schema<IComment>({
  body:  { type: String, required: true },
  author: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  forum: [{ type: mongoose.Schema.Types.ObjectId, ref: "Forum" }],
});

CommentSchema.add(BaseSchema);

export default mongoose.model<IComment>("Community", CommentSchema);
