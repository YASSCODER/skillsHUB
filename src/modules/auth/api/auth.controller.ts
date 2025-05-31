import { NextFunction, Request, Response } from "express";
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

  public forgetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // 1) Extract email
      const { email } = req.body as { email: string };

      // 2) Call the service (this.authService is now defined)
      const data = await this.authService.forgotPassword(email);

      // 3) Send success response once
      return res.status(200).json({
        message: "Password reset link sent",
        data, // { success: true }
      });
    } catch (err) {
      // 4) Delegate to error handler
      return next(err);
    }
  };

  public resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // 1) Extract token & new password from request body
      const { token, password } = req.body as {
        token: string;
        password: string;
      };

      // 2) Delegate to AuthService.resetPassword(token, password)
      await this.authService.resetPassword(token, password);

      // 3) Send exactly one success response
      return res
        .status(200)
        .json({ message: "Password has been reset successfully" });
    } catch (err) {
      // 4) Delegate to errorHandler via next(err)
      return next(err);
    }
  };
}

export default new AuthController(new AuthService(new UserService()));
