import bcrypt from "bcrypt";
import UserService from "../../user/api/user.service";
import { JwtDto } from "../dto/jwt.dto";
import jwt from "jsonwebtoken";
import { RegisterDto } from "../dto/register.dto";
import { RoleService } from "../../roles/api/role.service";
import * as crypto from "crypto";
import nodemailer from "nodemailer";
import { Request, Response } from "express";
import { RoleEnum } from "../../../common/enum/role.enum";
import userSchema from "../../../common/models/types/user.schema";

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
      userRole: RoleEnum.CLIENT,
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

  public async forgotPassword(email: string): Promise<{ success: true }> {
    // 1) Find the user by email
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    // 2) Generate a secure random token + expiration (1 hour from now)
    const token = crypto.randomBytes(20).toString("hex");
    const expirationTime = Date.now() + 3600_000; // now + 1 hour

    // 3) Persist token + expiry to the user document
    await user.updateOne({
      resetToken: token,
      resetTokenExpiresAt: expirationTime,
    });

    // 4) Build the reset link (pointing to your front‐end or a server route)
    const host = process.env.FRONTEND_URL || "http://localhost:4200";
    const resetLink = `${host}/reset-password/${token}`;

    // 5) Configure Nodemailer transport (Gmail example)
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, // typically "smtp.gmail.com"
      port: Number(process.env.MAIL_PORT) || 587, // 587 = STARTTLS
      secure: Number(process.env.MAIL_PORT) === 465, // true if 465, false if 587
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // your 16‐char App Password
      },
    });

    // 5a) Verify SMTP connectivity & authentication
    try {
      await transporter.verify();
      console.log("✅ SMTP verify success: ready to send mail");
    } catch (verifyErr) {
      console.error("❌ SMTP verify failed:", verifyErr);
      throw new Error(
        "SMTP verification failed: check EMAIL_USER, EMAIL_PASS, or network"
      );
    }

    // 6) Prepare the e‐mail content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      text: `Hello ${user.fullName},

You requested a password reset. Click the link below to set a new password:

${resetLink}

This link will expire in one hour.

If you did not request this, please ignore this email.

Thanks,
Your App Team`,
    };

    // 7) Send the e‐mail (using async/await)
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("📧 Sent reset email. MessageId:", info.messageId);
    } catch (sendErr) {
      console.error("❌ Error sending reset email:", sendErr);
      throw new Error("Error sending reset email");
    }

    // 8) Return success to the controller
    return { success: true };
  }

  public async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: true }> {
    // 1) Look up user by resetToken and ensure token is not expired:
    const user = await this.userService.findUserByResetToken(token);

    if (!user) {
      throw new Error("Invalid or expired token");
    }

    // 2) Hash the new password
    let hashedPassword: string;
    try {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    } catch (hashErr) {
      console.error("❌ Error hashing new password:", hashErr);
      throw new Error("Error hashing password");
    }

    // 3) Update only the fields we changed (password + clear tokens) via findByIdAndUpdate
    try {
      await userSchema.findByIdAndUpdate(
        user._id,
        {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiresAt: null,
        },
        {
          new: true,
          runValidators: true,
        }
      );
    } catch (saveErr) {
      console.error("❌ Error saving new password:", saveErr);
      throw new Error("Error saving new password");
    }

    // 4) Return success
    return { success: true };
  }
}

export default new AuthService(new UserService());
