import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RoleEnum } from "../enum/role.enum";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function Role(roles: RoleEnum[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid token" });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      res.status(403).json({ error: "Token is not valid" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const userRole = req.user.role as RoleEnum;

    if (!roles.includes(userRole)) {
      res.status(403).json({ error: "Access forbidden: Insufficient role" });
      return;
    }

    next();
  };
}
