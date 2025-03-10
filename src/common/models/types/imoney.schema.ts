import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { IImoney } from "../interface/imoney.interface";

const ImoneySchema: Schema = new Schema<IImoney>({
  currencyType: { type: String, required: true },
  value: { type: Number, required: true },
});
ImoneySchema.add(BaseSchema);
export default mongoose.model<IImoney>("Imoney", ImoneySchema);
