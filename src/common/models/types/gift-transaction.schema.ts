import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { IGiftTransaction } from "../interface/gift-transaction.interface";

const GiftTransactionSchema: Schema = new Schema<IGiftTransaction>({
  senderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  senderEmail: {
    type: String,
    required: true,
  },
  recipientUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipientName: {
    type: String,
    required: true,
  },
  recipientEmail: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
    max: 1000,
  },
  message: {
    type: String,
    maxlength: 200,
  },
  reason: {
    type: String,
    enum: ['birthday', 'congratulations', 'thank_you', 'just_because', 'other'],
    default: 'just_because',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  completedAt: {
    type: Date,
  },
  failureReason: {
    type: String,
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  cancelledAt: {
    type: Date,
  },
});

// Add base schema (createdAt, updatedAt)
GiftTransactionSchema.add(BaseSchema);

// Index for efficient queries
GiftTransactionSchema.index({ senderUserId: 1, createdAt: -1 });
GiftTransactionSchema.index({ recipientUserId: 1, createdAt: -1 });
GiftTransactionSchema.index({ status: 1 });
GiftTransactionSchema.index({ transactionId: 1 });

// Generate unique transaction ID before saving
GiftTransactionSchema.pre('save', function(next) {
  if (!this.transactionId && this.isNew) {
    this.transactionId = `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

export default mongoose.model<IGiftTransaction>("GiftTransaction", GiftTransactionSchema);
