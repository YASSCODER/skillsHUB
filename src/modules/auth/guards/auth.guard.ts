import { Response, Request, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: { role: string };
    }
  }
}

const authGuard =
  (requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (requiredRoles && !requiredRoles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (err) {
      return res.status(403).json({ message: "Access denied" });
    }
  };

export default authGuard;
