import { Router } from "express";
import { AuthService } from "./auth.service";
import catchAsync from "../../../common/utils/catch-async.utils";
import UserService from "../../user/api/user.service";
import { AuthController } from "./auth.controller";
import passport from "passport";
import "../../../config/google/google.config";

const router = Router();

const authController = new AuthController(new AuthService(new UserService()));

router.post("/register", catchAsync(authController.register));
router.post("/login", catchAsync(authController.login));
router.post("/forgot-password", catchAsync(authController.forgetPassword));
router.post("/reset-password", catchAsync(authController.resetPassword));

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const user = req.user as any;
    res.json({ message: "Google sign-in successful", user });
  }
);

export default router;
