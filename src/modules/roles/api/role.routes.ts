import { Router } from "express";
import catchAsync from "../../../common/utils/catch-async.utils";
import { RoleController } from "./role.controller";

const router = Router();
router.get("/", catchAsync(RoleController.getAllRoles));
router.get("/:id", catchAsync(RoleController.getRoleById));
router.post("/create-role", catchAsync(RoleController.createRole));
router.put("/:id", catchAsync(RoleController.updateRole));
router.delete("/:id", catchAsync(RoleController.deleteRole));

export default router;
