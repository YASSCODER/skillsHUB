import { Request, Response } from "express";
import UserService from "./user.service";

class UserController {

  constructor(private readonly userService: UserService) {}

  // Get all users
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.getAllUsers(); // Await the promise
      res.json(users); // Send the response after the promise resolves
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userService.getUserById(req.params.id); // Await the promise
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user); // Send the user data after resolving
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }


  async createUser(req: Request, res: Response) {
    try {
      const userData = req.body;

      // Validate password and fullName fields
      if (
        typeof userData.password !== "string" ||
        typeof userData.fullName !== "string" ||
        userData.password.trim() === "" ||
        userData.fullName.trim() === ""
      ) {
        return res
          .status(400)
          .json({ error: "Password and Full Name must be valid strings." });
      }

      const newUser = await this.userService.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      console.log(error); // Log error for debugging
      // If error is related to user creation, send the specific message
      if (
        error instanceof Error &&
        error.message.includes("User already exists")
      ) {
        return res.status(400).json({ error: error.message });
      }
      // Generic error handling for other unexpected errors
      res.status(500).json({ error: "Failed to create user" });
    }
  }


  async updateUser(req: Request, res: Response) {
    try {
      const updatedUser = await this.userService.updateUser(
        req.params.id,
        req.body
      ); // Await the promise
      if (!updatedUser)
        return res.status(404).json({ error: "User not found" });
      res.json(updatedUser); // Send the updated user data after resolving
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  }

  // Delete user by ID
  async deleteUser(req: Request, res: Response) {
    try {
      const deletedUser = await this.userService.deleteUser(req.params.id); // Await the promise
      if (!deletedUser)
        return res.status(404).json({ error: "User not found" });
      res.json({ message: "User deleted successfully" }); // Send the success message after resolving
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
}

export default UserController;
