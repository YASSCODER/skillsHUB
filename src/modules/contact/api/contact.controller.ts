import { Request, Response } from "express";
import { ContactService } from "./contact.service";

export class ContactController {
  // Send contact form email
  static async sendContactForm(req: Request, res: Response) {
    try {
      console.log("=== CONTACT FORM SUBMISSION ===");
      console.log("Request body:", req.body);

      const { name, email, subject, message, timestamp } = req.body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          error: "Missing required fields",
          required: ["name", "email", "subject", "message"]
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: "Invalid email format"
        });
      }

      // Validate field lengths
      if (name.length < 2) {
        return res.status(400).json({
          error: "Name must be at least 2 characters long"
        });
      }

      if (subject.length < 5) {
        return res.status(400).json({
          error: "Subject must be at least 5 characters long"
        });
      }

      if (message.length < 10) {
        return res.status(400).json({
          error: "Message must be at least 10 characters long"
        });
      }

      // Send email using ContactService
      const result = await ContactService.sendContactEmail({
        name,
        email,
        subject,
        message,
        timestamp: timestamp || new Date().toISOString()
      });

      console.log("Contact form email sent successfully:", result);

      res.status(200).json({
        message: "Contact form submitted successfully",
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          name,
          email,
          subject,
          messageLength: message.length
        }
      });

    } catch (error: any) {
      console.error("Error processing contact form:", error);
      res.status(500).json({
        error: "Failed to process contact form",
        message: error.message,
        success: false
      });
    }
  }

  // Send wallet activation request
  static async sendWalletActivationRequest(req: Request, res: Response) {
    try {
      console.log("=== WALLET ACTIVATION REQUEST ===");
      console.log("Request body:", req.body);

      const {
        userId,
        userName,
        userEmail,
        reason,
        message,
        priority,
        walletId,
        requestType,
        timestamp
      } = req.body;

      // Validate required fields
      if (!userId || !userName || !userEmail || !reason || !message || !walletId) {
        return res.status(400).json({
          error: "Missing required fields",
          required: ["userId", "userName", "userEmail", "reason", "message", "walletId"]
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        return res.status(400).json({
          error: "Invalid email format"
        });
      }

      // Validate field lengths
      if (userName.length < 2) {
        return res.status(400).json({
          error: "User name must be at least 2 characters long"
        });
      }

      if (message.length < 20) {
        return res.status(400).json({
          error: "Message must be at least 20 characters long"
        });
      }

      if (message.length > 500) {
        return res.status(400).json({
          error: "Message must not exceed 500 characters"
        });
      }

      // Validate reason
      const validReasons = ['account_review', 'payment_resolved', 'policy_compliance', 'technical_issue', 'other'];
      if (!validReasons.includes(reason)) {
        return res.status(400).json({
          error: "Invalid reason provided",
          validReasons
        });
      }

      // Validate priority
      const validPriorities = ['low', 'medium', 'high'];
      if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({
          error: "Invalid priority level",
          validPriorities
        });
      }

      // Send email using ContactService
      const result = await ContactService.sendWalletActivationEmail({
        userId,
        userName,
        userEmail,
        reason,
        message,
        priority: priority || 'medium',
        walletId,
        requestType: requestType || 'wallet_activation',
        timestamp: timestamp || new Date().toISOString()
      });

      console.log("Wallet activation request email sent successfully:", result);

      res.status(200).json({
        message: "Wallet activation request submitted successfully",
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          userId,
          userName,
          userEmail,
          reason,
          priority: priority || 'medium',
          walletId,
          messageLength: message.length
        }
      });

    } catch (error: any) {
      console.error("Error processing wallet activation request:", error);
      res.status(500).json({
        error: "Failed to process wallet activation request",
        message: error.message,
        success: false
      });
    }
  }

  // Get contact information (for display purposes)
  static async getContactInfo(req: Request, res: Response) {
    try {
      const contactInfo = {
        email: "support@smartskillz.com",
        phone: "+1 (555) 123-4567",
        address: {
          street: "123 Learning Street",
          city: "Education City",
          state: "EC",
          zipCode: "12345",
          country: "USA"
        },
        businessHours: {
          weekdays: "Monday - Friday: 9:00 AM - 6:00 PM",
          weekends: "Saturday - Sunday: 10:00 AM - 4:00 PM"
        },
        socialMedia: {
          twitter: "@smartskillz",
          linkedin: "company/smartskillz",
          facebook: "smartskillz"
        }
      };

      res.status(200).json({
        success: true,
        data: contactInfo
      });

    } catch (error: any) {
      console.error("Error getting contact info:", error);
      res.status(500).json({
        error: "Failed to get contact information",
        message: error.message,
        success: false
      });
    }
  }
}
