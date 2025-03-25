import { RoleService } from "./role.service";
import { Request, Response } from "express";

export class RoleController {
  static async createRole(req: Request, res: Response) {
    try {
      const role = await RoleService.createRole(req.body);
      res.status(201).json(role);
    } catch (error) {
      res.status(500).json({ error: "Failed to create role" });
    }
  }

  static async getAllRoles(req: Request, res: Response) {
    try {
      const roles = await RoleService.getAllRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  }

  static async getRoleById(req: Request, res: Response) {
    try {
      const role = await RoleService.getRoleById(req.params.id);
      if (!role) return res.status(404).json({ error: "Role not found" });
      res.json(role);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch role" });
    }
  }

  static async updateRole(req: Request, res: Response) {
    try {
      const updatedRole = await RoleService.updateRole(req.params.id, req.body);
      if (!updatedRole)
        return res.status(404).json({ error: "Role not found" });
      res.json(updatedRole);
    } catch (error) {
      res.status(500).json({ error: "Failed to update role" });
    }
  }

  static async deleteRole(req: Request, res: Response) {
    try {
      const deletedRole = await RoleService.deleteRole(req.params.id);
      if (!deletedRole)
        return res.status(404).json({ error: "Role not found" });
      res.json({ message: "Role deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete role" });
    }
  }
}
