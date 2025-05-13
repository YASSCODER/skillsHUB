import mongoose from "mongoose";
import { IForum } from "../interface/forum.interface";

const forumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  content_en: { type: String },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    score: { type: Number }
  }]
});

const Forum = mongoose.model<IForum>("Forum", forumSchema);

export default Forum;