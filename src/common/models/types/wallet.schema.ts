import mongoose, { Schema } from "mongoose";
import { IWallet } from "../interface/wallet.interface";
import { BaseSchema } from "../base-model.schema";

const WalletSchema: Schema = new Schema<IWallet>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  imoney: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Imoney",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
});

WalletSchema.add(BaseSchema);

export default mongoose.model<IWallet>("Wallet", WalletSchema);
