import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { IMarketplace } from "../interface/marketplac.interface";
export const MarketplaceSchema: Schema = new Schema <IMarketplace> ({
    title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
  status: { type: String, enum: ["active", "pending", "completed", "canceled"], default: "active" },
  createdAt: { type: Date, default: Date.now },



  

});

MarketplaceSchema.add(BaseSchema);

export default mongoose.model("Marketplace", MarketplaceSchema);
