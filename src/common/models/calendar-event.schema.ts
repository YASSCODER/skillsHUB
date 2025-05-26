import mongoose, { Schema, Document } from "mongoose";

export interface ICalendarEvent extends Document {
  title: string;
  salonId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  start: Date;
  end: Date;
  allDay: boolean;
  description?: string;
  color?: string;
  createdBy: mongoose.Types.ObjectId;
  attendees: mongoose.Types.ObjectId[];
  recurrence?: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    endDate?: Date;
  };
}

const CalendarEventSchema: Schema = new Schema({
  title: { type: String, required: true },
  salonId: { type: Schema.Types.ObjectId, ref: "Salon", required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  allDay: { type: Boolean, default: false },
  description: { type: String },
  color: { type: String, default: "#4a6ee0" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
  recurrence: {
    frequency: { type: String, enum: ["daily", "weekly", "monthly"] },
    interval: { type: Number, default: 1 },
    endDate: { type: Date }
  }
}, { timestamps: true });

export default mongoose.model<ICalendarEvent>("CalendarEvent", CalendarEventSchema);