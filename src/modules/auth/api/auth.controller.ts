import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../../user/dto/create-user.dto";
import UserService from "../../user/api/user.service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const user = await this.authService.register(payload);
      res.status(201).json({ message: "User registered successfully", user });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      res.status(400).json({ message: errorMessage });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const data = await this.authService.login(email, password);
      res.json({ message: "Login successful", data });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      res.status(400).json({ message: errorMessage });
    }
  };
}
export default new AuthController(new AuthService(new UserService()));
