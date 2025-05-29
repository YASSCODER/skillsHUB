import { Router } from "express";
import { ContactController } from "./contact.controller";

const router = Router();

// POST /api/contact/send - Send contact form
router.post("/send", ContactController.sendContactForm);

// GET /api/contact/info - Get contact information
router.get("/info", ContactController.getContactInfo);

export default router;
