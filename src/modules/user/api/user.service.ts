import userSchema from "../../../common/models/types/user.schema";

import { CreateUserDto } from "../dto/create-user.dto";

class UserService {
  async getAllUsers() {
    return await userSchema.find();
  }

  async getUserById(id: string) {
    return await userSchema.findById(id);
  }

  async createUser(userData: CreateUserDto) {
    return await userSchema.create(userData);
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
}

export default UserService;
