import mongoose, { Document } from "mongoose";

export interface IGiftTransaction extends Document {
  senderUserId: mongoose.Types.ObjectId;
  senderName: string;
  senderEmail: string;
  recipientUserId: mongoose.Types.ObjectId;
  recipientName: string;
  recipientEmail: string;
  amount: number;
  message?: string;
  reason?: 'birthday' | 'congratulations' | 'thank_you' | 'just_because' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  completedAt?: Date;
  failureReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGiftRequest {
  recipientEmail: string;
  amount: number;
  message?: string;
  reason?: 'birthday' | 'congratulations' | 'thank_you' | 'just_because' | 'other';
}

export interface IGiftResponse {
  success: boolean;
  message: string;
  gift?: IGiftTransaction;
  senderNewBalance?: number;
  recipientNewBalance?: number;
}
