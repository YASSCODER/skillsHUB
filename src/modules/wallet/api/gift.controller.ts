import { Request, Response } from "express";
import GiftService from "../services/gift.service";
import { IGiftRequest } from "../../../common/models/interface/gift-transaction.interface";

class GiftController {

  // Send a gift
  static async sendGift(req: Request, res: Response) {
    console.log("=== SEND GIFT CONTROLLER ===");
    console.log("Request body:", req.body);

    try {
      const { senderUserId, recipientEmail, amount, message, reason } = req.body;

      // Validate required fields
      if (!senderUserId) {
        return res.status(400).json({
          success: false,
          message: "Sender user ID is required"
        });
      }

      if (!recipientEmail) {
        return res.status(400).json({
          success: false,
          message: "Recipient email is required"
        });
      }

      if (!amount || amount < 1 || amount > 1000) {
        return res.status(400).json({
          success: false,
          message: "Amount must be between 1 and 1000 iMoney"
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address"
        });
      }

      // Validate message length if provided
      if (message && message.length > 200) {
        return res.status(400).json({
          success: false,
          message: "Message cannot exceed 200 characters"
        });
      }

      const giftRequest: IGiftRequest = {
        recipientEmail,
        amount: Number(amount),
        message,
        reason
      };

      const result = await GiftService.sendGift(senderUserId, giftRequest);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error: any) {
      console.error("sendGift controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error while sending gift"
      });
    }
  }

  // Get gift history for a user
  static async getGiftHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          error: "User ID is required"
        });
      }

      const history = await GiftService.getGiftHistory(userId);
      res.status(200).json(history);

    } catch (error: any) {
      console.error("getGiftHistory controller error:", error);
      res.status(500).json({
        error: "Failed to fetch gift history"
      });
    }
  }

  // Get sent gifts for a user
  static async getSentGifts(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          error: "User ID is required"
        });
      }

      const sentGifts = await GiftService.getSentGifts(userId);
      res.status(200).json(sentGifts);

    } catch (error: any) {
      console.error("getSentGifts controller error:", error);
      res.status(500).json({
        error: "Failed to fetch sent gifts"
      });
    }
  }

  // Get received gifts for a user
  static async getReceivedGifts(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          error: "User ID is required"
        });
      }

      const receivedGifts = await GiftService.getReceivedGifts(userId);
      res.status(200).json(receivedGifts);

    } catch (error: any) {
      console.error("getReceivedGifts controller error:", error);
      res.status(500).json({
        error: "Failed to fetch received gifts"
      });
    }
  }

  // Cancel a gift
  static async cancelGift(req: Request, res: Response) {
    console.log("=== CANCEL GIFT CONTROLLER ===");
    console.log("Request params:", req.params);
    console.log("Request body:", req.body);

    try {
      const { giftId } = req.params;
      const { userId } = req.body;

      if (!giftId) {
        return res.status(400).json({
          success: false,
          message: "Gift ID is required"
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required"
        });
      }

      const result = await GiftService.cancelGift(giftId, userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error: any) {
      console.error("cancelGift controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error while cancelling gift"
      });
    }
  }

  // Search users with wallets by email
  static async searchUsersWithWallets(req: Request, res: Response) {
    try {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          error: "Email query parameter is required"
        });
      }

      if (email.length < 2) {
        return res.status(400).json({
          error: "Email query must be at least 2 characters long"
        });
      }

      const result = await GiftService.searchUsersWithWallets(email);
      res.status(200).json(result);

    } catch (error: any) {
      console.error("searchUsersWithWallets controller error:", error);
      res.status(500).json({
        error: "Failed to search users"
      });
    }
  }

  // Get gift analytics (admin only)
  static async getGiftAnalytics(req: Request, res: Response) {
    try {
      const analytics = await GiftService.getGiftAnalytics();
      res.status(200).json(analytics);

    } catch (error: any) {
      console.error("getGiftAnalytics controller error:", error);
      res.status(500).json({
        error: "Failed to fetch gift analytics"
      });
    }
  }

  // Test gift email endpoint
  static async testGiftEmail(req: Request, res: Response) {
    console.log("=== TEST GIFT EMAIL ENDPOINT ===");

    try {
      const { type, recipientEmail, senderEmail } = req.body;

      if (!type || !['received', 'sent'].includes(type)) {
        return res.status(400).json({ error: "Type must be 'received' or 'sent'" });
      }

      if (type === 'received' && !recipientEmail) {
        return res.status(400).json({ error: "recipientEmail is required for 'received' type" });
      }

      if (type === 'sent' && !senderEmail) {
        return res.status(400).json({ error: "senderEmail is required for 'sent' type" });
      }

      // Test email functionality using the same pattern as auth service
      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      let emailResult;

      if (type === 'received') {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipientEmail,
          subject: "🎁 Test Gift Received - SmartSkillz",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: white; border-radius: 10px;">
              <h1 style="color: #ec4899;">🎁 Test Gift Received!</h1>
              <p>This is a test email for the gift received notification.</p>
              <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Gift Details:</h3>
                <p><strong>Amount:</strong> 50 iMoney</p>
                <p><strong>From:</strong> Test Sender</p>
                <p><strong>Message:</strong> This is a test gift message!</p>
              </div>
              <p style="color: #6b7280; font-size: 14px;">SmartSkillz - Advanced Learning Platform</p>
            </div>
          `
        };

        emailResult = await new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, (error: any, info: any) => {
            if (error) {
              reject(error);
            } else {
              resolve(info);
            }
          });
        });
      } else {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: senderEmail,
          subject: "✅ Test Gift Sent - SmartSkillz",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: white; border-radius: 10px;">
              <h1 style="color: #10b981;">✅ Test Gift Sent Successfully!</h1>
              <p>This is a test email for the gift sent confirmation.</p>
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Gift Details:</h3>
                <p><strong>Amount:</strong> 50 iMoney</p>
                <p><strong>To:</strong> Test Recipient</p>
                <p><strong>Message:</strong> This is a test gift message!</p>
              </div>
              <p style="color: #6b7280; font-size: 14px;">SmartSkillz - Advanced Learning Platform</p>
            </div>
          `
        };

        emailResult = await new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, (error: any, info: any) => {
            if (error) {
              reject(error);
            } else {
              resolve(info);
            }
          });
        });
      }

      res.status(200).json({
        message: `Test ${type} gift email sent successfully`,
        result: emailResult
      });

    } catch (error: any) {
      console.error("testGiftEmail error:", error);
      res.status(500).json({
        error: "Failed to send test email",
        details: error.message
      });
    }
  }
}

export default GiftController;
