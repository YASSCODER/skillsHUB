import bcrypt from "bcrypt";
import UserService from "../../user/api/user.service";
import { JwtDto } from "../dto/jwt.dto";
import jwt from "jsonwebtoken";
import { RegisterDto } from "../dto/register.dto";
import { RoleService } from "../../roles/api/role.service";

export class AuthService {
  constructor(private readonly userService: UserService) {}

  register = async (userData: RegisterDto) => {
    const { email, password, fullName } = userData;

    const userExists = await this.userService.findUserByEmail(email);
    if (userExists) {
      throw new Error("User already exists");
    }

    const clientRole = await RoleService.getRoleByName("CLIENT");
    if (!clientRole) {
      throw new Error("Client role not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = clientRole._id as string;

    const data = {
      fullName,
      email: email,
      password: hashedPassword,
      role: userRole,
    };

    const user = await this.userService.createUser(data);
    return user;
  };

  login = async (email: string, password: string) => {
    const user = await this.userService.findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }

    const userRole = await RoleService.getRoleById(user.role._id.toString());
    if (!userRole) {
      throw new Error("Role not found");
    }

    const payload: JwtDto = { email: user.email };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "yourSecret", {
      expiresIn: "1h",
    });

    const data = {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: userRole.title,
      },
      token: token,
    };
    return data;
  };
}

export default new AuthService(new UserService());
