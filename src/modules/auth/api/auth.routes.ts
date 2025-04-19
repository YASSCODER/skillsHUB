import { Router } from "express";
import { AuthService } from "./auth.service";
import catchAsync from "../../../common/utils/catch-async.utils";
import UserService from "../../user/api/user.service";
import { AuthController } from "./auth.controller";

const router = Router();

const authController = new AuthController(new AuthService(new UserService()));

router.post("/register", catchAsync(authController.register));
router.post("/login", catchAsync(authController.login));
router.post("/forgot-password", catchAsync(authController.forgetPassword));

export default router;
