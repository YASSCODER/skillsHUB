import { Router } from "express";
import CategoryRoutes from "./api/Category.routes";

const CategoryModule: { path: string; handler: Router } = {
  path: "/Category",
  handler: CategoryRoutes,
};

export default CategoryModule;
