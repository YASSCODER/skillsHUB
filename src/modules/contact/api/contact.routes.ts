import { Router } from "express";
import { ContactController } from "./contact.controller";

const router = Router();

// POST /api/contact/send - Send contact form
router.post("/send", ContactController.sendContactForm);

// POST /api/contact/wallet-activation-request - Send wallet activation request
router.post("/wallet-activation-request", ContactController.sendWalletActivationRequest);

// GET /api/contact/info - Get contact information
router.get("/info", ContactController.getContactInfo);

export default router;
