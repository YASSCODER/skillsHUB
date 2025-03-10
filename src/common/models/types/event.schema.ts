import mongoose, { Schema } from "mongoose";
import { IEvent } from "../interface/event.interface";
import { BaseSchema } from "../base-model.schema";

const EventSchema: Schema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },
});

EventSchema.add(BaseSchema);
export default mongoose.model<IEvent>("Event", EventSchema);
