import mongoose, { Schema } from "mongoose";
import { BaseSchema } from "../base-model.schema";
import { IRole } from "../interface/role.interface";
import { RoleEnum } from "../../enum/role.enum";

export const roleSchema: Schema = new Schema<IRole>({
  title: { type: String, required: true, enum: Object.values(RoleEnum) },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

roleSchema.add(BaseSchema);

export default mongoose.model<IRole>("Role", roleSchema);
