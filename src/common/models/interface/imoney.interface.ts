import { Document } from "mongoose";

export interface IImoney extends Document {
  currencyType: string;
  value: number;
}
