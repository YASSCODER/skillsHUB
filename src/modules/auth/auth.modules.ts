import { Router } from "express";
import authRoutes from "./api/auth.routes";

const AuthModule: { path: string; handler: Router } = {
  path: "/auth",
  handler: authRoutes,
};

export default AuthModule;
