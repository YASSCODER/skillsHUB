import { Router } from "express";
import UserController from "./user.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

import UserService from "./user.service";

const router = Router();

const userService = new UserService(); // Or inject it via DI if using a DI container
const userController = new UserController(userService);

router.get("/", catchAsync(userController.getAllUsers.bind(userController)));
router.get("/:id", catchAsync(userController.getUserById.bind(userController)));
router.post("/", catchAsync(userController.createUser.bind(userController)));
router.put("/:id", catchAsync(userController.updateUser.bind(userController)));
router.delete(
  "/:id",
  catchAsync(userController.deleteUser.bind(userController))
);

export default router;
