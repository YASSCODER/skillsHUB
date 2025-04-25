import express from "express";
import nodemailer from "nodemailer";
const router = express.Router();

router.post("/send", async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    res.status(200).json({ message: "Email envoyé avec succès ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'envoi ❌" });
  }
});

export default router;
