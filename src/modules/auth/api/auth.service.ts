import bcrypt from "bcrypt";
import UserService from "../../user/api/user.service";
import { JwtDto } from "../dto/jwt.dto";
import jwt from "jsonwebtoken";
import { RegisterDto } from "../dto/register.dto";
import { RoleService } from "../../roles/api/role.service";
import * as crypto from "crypto";
import nodemailer from "nodemailer";
import { Request, Response } from "express";

export class AuthService {
  constructor(private readonly userService: UserService) {}

  register = async (userData: RegisterDto) => {
    const { email, password, fullName, skills = [] } = userData;

    const userExists = await this.userService.findUserByEmail(email);
    if (userExists) {
      throw new Error("User already exists");
    }

    const clientRole = await RoleService.getRoleByName("CLIENT");
    if (!clientRole) {
      throw new Error("Client role not found");
    }

    const userRole = clientRole._id as string;

    const data = {
      fullName,
      email: email,
      password,
      role: userRole,
      skills,
    };

    const user = await this.userService.createUser(data);
    return user;
  };

  login = async (email: string, password: string) => {
    const user = await this.userService.findUserByEmail(email);

    const isMatched = user && (await bcrypt.compare(password, user.password));

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

    console.log("Generated Token:", token);

    const data = {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: userRole.title,
        skills: user.skills || [],
      },
      token: token,
    };
    return data;
  };

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body as unknown as { email: string };

    console.log("Email:", email);

    const user = await this.userService.findUserByEmail(email);
    console.log("User:", user);
    if (!user) {
      throw new Error("User not found");
    }

    const token = crypto.randomBytes(20).toString("hex");

    console.log("Token:", token);

    const expirationTime = Date.now() + 3600000;
    console.log("Expiration Time:", expirationTime);

    user.resetToken = token;
    user.resetTokenExpiresAt = expirationTime;

    try {
      await user.updateOne({
        resetToken: token,
        resetTokenExpiresAt: expirationTime,
      });

      console.log("User after updating:", user);
    } catch (err) {
      console.log("Error updating user:", err);
      return res
        .status(500)
        .json({ message: "Error updating user with reset token" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      text: `Click the following link to reset your password: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: "Error sending email" });
      }
      res.status(200).json({ message: "Password reset email sent" });
    });
  };
}

export default new AuthService(new UserService());
