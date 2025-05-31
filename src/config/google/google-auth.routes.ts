import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = Router();

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
    // Successful authentication
    // Generate a JWT and send it to the frontend
    const user = req.user as any;
    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET || "yourSecret",
      { expiresIn: "1h" }
    );
    // You can redirect or send the token as JSON
    res.json({ message: "Google sign-in successful", user, token });
  }
);

export default router;
