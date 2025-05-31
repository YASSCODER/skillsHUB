import { Types } from "mongoose";
import { RoleEnum } from "../../../common/enum/role.enum";

export class CreateUserDto {
  fullName!: string;
  email!: string;
  password!: string;
  role!: string | Types.ObjectId;
  userRole!: RoleEnum;
}
