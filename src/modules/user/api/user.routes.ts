import { Router } from "express";
import UserController from "./user.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();

router.get("/", catchAsync(UserController.getAllUsers));
router.get("/:id", catchAsync(UserController.getUserById));
router.post("/", catchAsync(UserController.createUser));
router.put("/:id", catchAsync(UserController.updateUser));
router.delete("/:id", catchAsync(UserController.deleteUser));

export default router;
