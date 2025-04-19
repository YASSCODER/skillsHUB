import { Request, Response } from "express";
import UserService from "./user.service";

class UserController {
  constructor(private readonly userService: UserService) {}
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = this.userService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const newUser = this.userService.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const updatedUser = this.userService.updateUser(req.params.id, req.body);
      if (!updatedUser)
        return res.status(404).json({ error: "User not found" });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const deletedUser = this.userService.deleteUser(req.params.id);
      if (!deletedUser)
        return res.status(404).json({ error: "User not found" });
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
}

export default UserController;
