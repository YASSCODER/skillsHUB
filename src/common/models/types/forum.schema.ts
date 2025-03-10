import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { IForum } from "../interface/forum.interface";

const ForumSchema: Schema = new Schema<IForum>({
  title: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, required: true },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },
});

ForumSchema.add(BaseSchema);
export default mongoose.model<IForum>("Forum", ForumSchema);
