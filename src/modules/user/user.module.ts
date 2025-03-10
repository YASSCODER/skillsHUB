import { Router } from "express";
import userRoutes from "./api/user.routes";

const UserModule: { path: string; handler: Router } = {
  path: "/users",
  handler: userRoutes,
};

export default UserModule;
