import { Router } from "express";
import roleRoutes from "./api/role.routes";

const RoleModule: { path: string; handler: Router } = {
  path: "/roles",
  handler: roleRoutes,
};

export default RoleModule;
