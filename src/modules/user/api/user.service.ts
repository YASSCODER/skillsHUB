import userSchema from "../../../common/models/types/user.schema";
import { CreateUserDto } from "../dto/create-user.dto";

class UserService {
  static async getAllUsers() {
    return await userSchema.find();
  }

  static async getUserById(id: string) {
    return await userSchema.findById(id);
  }

  static async createUser(userData: CreateUserDto) {
    return await userSchema.create(userData);
  }

  static async updateUser(id: string, userData: any) {
    return await userSchema.findByIdAndUpdate(id, userData, { new: true });
  }

  static async deleteUser(id: string) {
    return await userSchema.findByIdAndDelete(id);
  }
}

export default UserService;
