import userSchema from "../../../common/models/types/user.schema";
import { CreateUserDto } from "../dto/create-user.dto";
import bcrypt from "bcrypt";

class UserService {
  async getAllUsers() {
    return await userSchema.find();
  }

  async getUserById(id: string) {
    const userFOund = await userSchema.findById(id);
    console.log(userFOund);
    return userFOund;
  }

  async createUser(userData: CreateUserDto) {
    const existingUser = await userSchema.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;
    const newUser = new userSchema(userData);
    await newUser.save();
    return newUser;
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
