import { RoleEnum } from "../../../common/enum/role.enum";
import roleSchema from "../../../common/models/types/role.schema";
import userSchema from "../../../common/models/types/user.schema";
import { RoleService } from "../../roles/api/role.service";
import { CreateUserDto } from "../dto/create-user.dto";
import bcrypt from "bcrypt";

class UserService {
  async getAllUsers() {
    return await userSchema.find();
  }

  async getUserById(id: string) {
    const userFOund = await userSchema.findById(id);

    return userFOund;
  }

  async createUser(userData: CreateUserDto) {
    const existingUser = await userSchema.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

    // Fetch the role document using the ObjectId string
    if (userData.role) {
      const roleDoc = await roleSchema.findById(userData.role);
      if (roleDoc?.title === "ADMIN") {
        userData.userRole = RoleEnum.ADMIN;
      } else if (roleDoc?.title === "CLIENT") {
        userData.userRole = RoleEnum.CLIENT;
      }
    }

    const newUser = new userSchema(userData);
    await newUser.save();
    return newUser;
  }

  async findUserByResetToken(token: string) {
    const userFound = userSchema.findOne({
      resetToken: token,
      resetTokenExpiresAt: { $gt: Date.now() },
    });

    return userFound;
  }

  async updateUser(id: string, userData: any) {
    return await userSchema.findByIdAndUpdate(id, userData, { new: true });
  }

  async deleteUser(id: string) {
    return await userSchema.findByIdAndDelete(id);
  }

  async findUserByEmail(email: string) {
    return await userSchema.findOne({ email });
  }

  async countClient() {
    const userFound = await userSchema.find();
    const userFiltered = userFound.filter(
      (user) => user.userRole === RoleEnum.CLIENT
    );
    return {
      count: userFiltered.length,
    };
  }
}

export default UserService;
