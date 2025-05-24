import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  userId: string;
  message: string;
  date: Date;
  lu: boolean;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, ref: "User", required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  lu: { type: Boolean, default: false }
});

export default mongoose.model<INotification>("Notification", NotificationSchema);