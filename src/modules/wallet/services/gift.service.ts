import GiftTransactionSchema from "../../../common/models/types/gift-transaction.schema";
import WalletSchema from "../../../common/models/types/wallet.schema";
import UserSchema from "../../../common/models/types/user.schema";
import ImoneySchema from "../../../common/models/types/imoney.schema";
import { IGiftRequest, IGiftResponse } from "../../../common/models/interface/gift-transaction.interface";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

class GiftService {

  // Send a gift from one user to another
  static async sendGift(senderUserId: string, giftRequest: IGiftRequest): Promise<IGiftResponse> {
    console.log("=== SEND GIFT START ===");
    console.log("sendGift - Input:", { senderUserId, giftRequest });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Validate sender
      const sender = await UserSchema.findById(senderUserId).session(session);
      if (!sender) {
        throw new Error("Sender not found");
      }

      // 2. Find recipient by email (only users with wallets)
      const recipient = await UserSchema.findOne({ email: giftRequest.recipientEmail }).session(session);
      if (!recipient) {
        throw new Error("Recipient not found. Please check the email address.");
      }

      // 3. Check if recipient has a wallet
      const recipientWallet = await WalletSchema.findOne({ user: recipient._id }).populate("imoney").session(session);
      if (!recipientWallet) {
        throw new Error("Recipient doesn't have a wallet. They need to create a wallet first.");
      }

      // 4. Prevent self-gifting
      if (senderUserId === (recipient._id as any).toString()) {
        throw new Error("You cannot send a gift to yourself");
      }

      // 5. Get sender's wallet and validate balance
      const senderWallet = await WalletSchema.findOne({ user: senderUserId }).populate("imoney").session(session);
      if (!senderWallet || !senderWallet.imoney) {
        throw new Error("Sender wallet not found");
      }

      if (!senderWallet.isActive) {
        throw new Error("Sender wallet is not active");
      }

      const senderBalance = (senderWallet.imoney as any).value;
      if (senderBalance < giftRequest.amount) {
        throw new Error(`Insufficient balance. You have ${senderBalance} iMoney, but need ${giftRequest.amount} iMoney.`);
      }

      // 6. Validate amount
      if (giftRequest.amount < 1 || giftRequest.amount > 1000) {
        throw new Error("Gift amount must be between 1 and 1000 iMoney");
      }

      // 7. Create gift transaction record
      const giftTransaction = new GiftTransactionSchema({
        senderUserId: sender._id,
        senderName: sender.fullName,
        senderEmail: sender.email,
        recipientUserId: recipient._id,
        recipientName: recipient.fullName,
        recipientEmail: recipient.email,
        amount: giftRequest.amount,
        message: giftRequest.message,
        reason: giftRequest.reason || 'just_because',
        status: 'pending'
      });

      await giftTransaction.save({ session });

      // 8. Transfer iMoney
      // Deduct from sender
      const updatedSenderImoney = await ImoneySchema.findByIdAndUpdate(
        senderWallet.imoney._id,
        { $inc: { value: -giftRequest.amount } },
        { new: true, session }
      );

      if (!updatedSenderImoney) {
        throw new Error("Failed to deduct iMoney from sender");
      }

      // Add to recipient
      const updatedRecipientImoney = await ImoneySchema.findByIdAndUpdate(
        recipientWallet.imoney._id,
        { $inc: { value: giftRequest.amount } },
        { new: true, session }
      );

      if (!updatedRecipientImoney) {
        throw new Error("Failed to add iMoney to recipient");
      }

      // 9. Update gift transaction status
      giftTransaction.status = 'completed';
      giftTransaction.completedAt = new Date();
      await giftTransaction.save({ session });

      // 10. Commit transaction
      await session.commitTransaction();

      console.log("sendGift - Gift completed successfully:", {
        giftId: giftTransaction._id,
        senderNewBalance: updatedSenderImoney.value,
        recipientNewBalance: updatedRecipientImoney.value
      });

      // 11. Send email notifications (async, don't wait)
      this.sendGiftNotifications(giftTransaction, updatedSenderImoney.value, updatedRecipientImoney.value)
        .catch(error => console.error("Error sending gift notifications:", error));

      console.log("=== SEND GIFT END ===");

      return {
        success: true,
        message: `Gift of ${giftRequest.amount} iMoney sent successfully to ${recipient.fullName}!`,
        gift: giftTransaction,
        senderNewBalance: updatedSenderImoney.value,
        recipientNewBalance: updatedRecipientImoney.value
      };

    } catch (error: any) {
      await session.abortTransaction();
      console.error("sendGift - Error:", error.message);

      return {
        success: false,
        message: error.message || "Failed to send gift"
      };
    } finally {
      session.endSession();
    }
  }

  // Get gift history for a user (both sent and received)
  static async getGiftHistory(userId: string) {
    console.log("getGiftHistory - userId:", userId);

    const sentGifts = await GiftTransactionSchema.find({ senderUserId: userId })
      .sort({ createdAt: -1 })
      .lean();

    const receivedGifts = await GiftTransactionSchema.find({ recipientUserId: userId })
      .sort({ createdAt: -1 })
      .lean();

    return {
      sent: sentGifts,
      received: receivedGifts,
      total: sentGifts.length + receivedGifts.length
    };
  }

  // Get sent gifts for a user
  static async getSentGifts(userId: string) {
    return await GiftTransactionSchema.find({ senderUserId: userId })
      .sort({ createdAt: -1 })
      .lean();
  }

  // Get received gifts for a user
  static async getReceivedGifts(userId: string) {
    return await GiftTransactionSchema.find({ recipientUserId: userId })
      .sort({ createdAt: -1 })
      .lean();
  }

  // Cancel a pending gift (within 1 hour)
  static async cancelGift(giftId: string, userId: string): Promise<IGiftResponse> {
    console.log("=== CANCEL GIFT START ===");
    console.log("cancelGift - Input:", { giftId, userId });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Find the gift transaction
      const gift = await GiftTransactionSchema.findById(giftId).session(session);
      if (!gift) {
        throw new Error("Gift transaction not found");
      }

      // 2. Verify the user is the sender
      if (gift.senderUserId.toString() !== userId) {
        throw new Error("You can only cancel gifts that you sent");
      }

      // 3. Check if gift is still pending
      if (gift.status !== 'pending') {
        throw new Error(`Cannot cancel gift with status: ${gift.status}`);
      }

      // 4. Check if within cancellation window (1 hour)
      const now = new Date();
      const giftTime = new Date(gift.createdAt);
      const hoursDiff = (now.getTime() - giftTime.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 1) {
        throw new Error("Gift can only be cancelled within 1 hour of sending");
      }

      // 5. Get wallets
      const senderWallet = await WalletSchema.findOne({ user: gift.senderUserId }).populate("imoney").session(session);
      const recipientWallet = await WalletSchema.findOne({ user: gift.recipientUserId }).populate("imoney").session(session);

      if (!senderWallet || !recipientWallet) {
        throw new Error("Wallet not found for cancellation");
      }

      // 6. Reverse the transaction
      // Add back to sender
      const updatedSenderImoney = await ImoneySchema.findByIdAndUpdate(
        senderWallet.imoney._id,
        { $inc: { value: gift.amount } },
        { new: true, session }
      );

      // Deduct from recipient
      const updatedRecipientImoney = await ImoneySchema.findByIdAndUpdate(
        recipientWallet.imoney._id,
        { $inc: { value: -gift.amount } },
        { new: true, session }
      );

      if (!updatedSenderImoney || !updatedRecipientImoney) {
        throw new Error("Failed to reverse gift transaction");
      }

      // 7. Update gift status
      gift.status = 'cancelled';
      gift.cancelledBy = new mongoose.Types.ObjectId(userId);
      gift.cancelledAt = new Date();
      await gift.save({ session });

      await session.commitTransaction();

      console.log("cancelGift - Gift cancelled successfully:", {
        giftId: gift._id,
        senderNewBalance: updatedSenderImoney.value
      });

      console.log("=== CANCEL GIFT END ===");

      return {
        success: true,
        message: "Gift cancelled successfully. iMoney has been returned to your wallet.",
        gift: gift,
        senderNewBalance: updatedSenderImoney.value
      };

    } catch (error: any) {
      await session.abortTransaction();
      console.error("cancelGift - Error:", error.message);

      return {
        success: false,
        message: error.message || "Failed to cancel gift"
      };
    } finally {
      session.endSession();
    }
  }

  // Search users who have wallets by email
  static async searchUsersWithWallets(emailQuery: string) {
    console.log("searchUsersWithWallets - emailQuery:", emailQuery);

    // Find users whose email contains the query and have wallets
    const usersWithWallets = await UserSchema.aggregate([
      {
        $match: {
          email: { $regex: emailQuery, $options: 'i' }
        }
      },
      {
        $lookup: {
          from: 'wallets',
          localField: '_id',
          foreignField: 'user',
          as: 'wallet'
        }
      },
      {
        $match: {
          'wallet.0': { $exists: true } // Only users with wallets
        }
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          email: 1
        }
      },
      {
        $limit: 10 // Limit results for performance
      }
    ]);

    return {
      users: usersWithWallets
    };
  }

  // Send email notifications for gift
  private static async sendGiftNotifications(gift: any, senderNewBalance: number, recipientNewBalance: number) {
    try {
      // Create transporter using same pattern as auth service
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Send notification to recipient
      await this.sendGiftReceivedEmail(transporter, {
        recipientEmail: gift.recipientEmail,
        recipientName: gift.recipientName,
        senderName: gift.senderName,
        amount: gift.amount,
        message: gift.message,
        reason: gift.reason,
        newBalance: recipientNewBalance,
        transactionId: gift.transactionId
      });

      // Send confirmation to sender
      await this.sendGiftSentConfirmationEmail(transporter, {
        senderEmail: gift.senderEmail,
        senderName: gift.senderName,
        recipientName: gift.recipientName,
        amount: gift.amount,
        message: gift.message,
        reason: gift.reason,
        newBalance: senderNewBalance,
        transactionId: gift.transactionId
      });

    } catch (error) {
      console.error("Error sending gift notifications:", error);
      // Don't throw error - gift was successful even if email fails
    }
  }

  // Get gift analytics for admin
  static async getGiftAnalytics() {
    const analytics = await GiftTransactionSchema.aggregate([
      {
        $group: {
          _id: null,
          totalGifts: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedGifts: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingGifts: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          cancelledGifts: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          averageGiftAmount: { $avg: '$amount' }
        }
      }
    ]);

    return analytics[0] || {
      totalGifts: 0,
      totalAmount: 0,
      completedGifts: 0,
      pendingGifts: 0,
      cancelledGifts: 0,
      averageGiftAmount: 0
    };
  }

  // Send gift received email using same pattern as auth service
  private static async sendGiftReceivedEmail(transporter: any, data: any): Promise<void> {
    const reasonEmojis: { [key: string]: string } = {
      birthday: '🎂',
      congratulations: '🎉',
      thank_you: '🙏',
      just_because: '💝',
      other: '✨'
    };

    const reasonLabels: { [key: string]: string } = {
      birthday: 'Birthday Gift',
      congratulations: 'Congratulations',
      thank_you: 'Thank You',
      just_because: 'Just Because',
      other: 'Special Gift'
    };

    const reasonEmoji = reasonEmojis[data.reason || 'just_because'] || '🎁';
    const reasonLabel = reasonLabels[data.reason || 'just_because'] || 'Gift';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: data.recipientEmail,
      subject: `🎁 You received ${data.amount} iMoney from ${data.senderName} on SmartSkillz!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">${reasonEmoji} Gift Received!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone special sent you iMoney</p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${data.recipientName}! 👋</h2>

            <p style="color: #555; line-height: 1.6;">
              Great news! You've received a wonderful gift on SmartSkillz.
            </p>

            <!-- Gift Details -->
            <div style="background: linear-gradient(135deg, #fdf2f8, #f3e8ff); padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; border: 2px solid #ec4899;">
              <div style="font-size: 40px; margin-bottom: 10px;">${reasonEmoji}</div>
              <h3 style="color: #ec4899; margin: 0 0 10px 0;">${reasonLabel}</h3>
              <div style="font-size: 28px; font-weight: bold; color: #ec4899; margin: 10px 0;">${data.amount.toLocaleString()} iMoney</div>
              <p style="color: #6b7280; margin: 10px 0;">
                <strong>From:</strong> ${data.senderName}
              </p>
            </div>

            ${data.message ? `
            <!-- Personal Message -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
              <h4 style="color: #8b5cf6; margin-top: 0;">💌 Personal Message:</h4>
              <p style="color: #374151; font-style: italic; margin: 0;">
                "${data.message}"
              </p>
            </div>
            ` : ''}

            <!-- Balance Update -->
            <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #10b981; margin-top: 0;">💰 Wallet Updated</h3>
              <p style="color: #065f46; margin: 0;">
                Your new wallet balance: <strong>${data.newBalance.toLocaleString()} iMoney</strong>
              </p>
            </div>

            <!-- Transaction Details -->
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #374151; margin-top: 0; font-size: 12px; text-transform: uppercase;">Transaction Details</h4>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">
                <strong>Transaction ID:</strong> ${data.transactionId || 'N/A'}
              </p>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">
                <strong>Date:</strong> ${new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px; text-align: center; color: #6b7280;">
            <p style="margin: 0; font-size: 14px;">
              <strong>SmartSkillz</strong> - Advanced Learning Platform
            </p>
          </div>
        </div>
      `
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
          console.error("Error sending gift received email:", error);
          reject(error);
        } else {
          console.log("Gift received email sent successfully:", info.response);
          resolve();
        }
      });
    });
  }

  // Send gift sent confirmation email using same pattern as auth service
  private static async sendGiftSentConfirmationEmail(transporter: any, data: any): Promise<void> {
    const reasonEmojis: { [key: string]: string } = {
      birthday: '🎂',
      congratulations: '🎉',
      thank_you: '🙏',
      just_because: '💝',
      other: '✨'
    };

    const reasonLabels: { [key: string]: string } = {
      birthday: 'Birthday Gift',
      congratulations: 'Congratulations',
      thank_you: 'Thank You',
      just_because: 'Just Because',
      other: 'Special Gift'
    };

    const reasonEmoji = reasonEmojis[data.reason || 'just_because'] || '🎁';
    const reasonLabel = reasonLabels[data.reason || 'just_because'] || 'Gift';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: data.senderEmail,
      subject: `✅ Gift Sent! ${data.amount} iMoney delivered to ${data.recipientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">${reasonEmoji} Gift Sent Successfully!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your generosity has been delivered</p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${data.senderName}! 👋</h2>

            <p style="color: #555; line-height: 1.6;">
              Your gift has been successfully sent and delivered! Here's a summary:
            </p>

            <!-- Gift Confirmation -->
            <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; border: 2px solid #10b981;">
              <div style="font-size: 40px; margin-bottom: 10px;">✅</div>
              <h3 style="color: #10b981; margin: 0 0 10px 0;">${reasonLabel} Delivered</h3>
              <div style="font-size: 28px; font-weight: bold; color: #10b981; margin: 10px 0;">${data.amount.toLocaleString()} iMoney</div>
              <p style="color: #6b7280; margin: 10px 0;">
                <strong>To:</strong> ${data.recipientName}
              </p>
            </div>

            ${data.message ? `
            <!-- Your Message -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
              <h4 style="color: #8b5cf6; margin-top: 0;">💌 Your Message:</h4>
              <p style="color: #374151; font-style: italic; margin: 0;">
                "${data.message}"
              </p>
            </div>
            ` : ''}

            <!-- Balance Update -->
            <div style="background: linear-gradient(135deg, #dbeafe, #e0e7ff); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #3b82f6; margin-top: 0;">💰 Your Wallet</h3>
              <p style="color: #1e40af; margin: 0;">
                Your remaining balance: <strong>${data.newBalance.toLocaleString()} iMoney</strong>
              </p>
            </div>

            <!-- Transaction Details -->
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #374151; margin-top: 0; font-size: 12px; text-transform: uppercase;">Transaction Details</h4>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">
                <strong>Transaction ID:</strong> ${data.transactionId || 'N/A'}
              </p>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">
                <strong>Date:</strong> ${new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px; text-align: center; color: #6b7280;">
            <p style="margin: 0; font-size: 14px;">
              <strong>SmartSkillz</strong> - Advanced Learning Platform
            </p>
          </div>
        </div>
      `
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
          console.error("Error sending gift sent confirmation email:", error);
          reject(error);
        } else {
          console.log("Gift sent confirmation email sent successfully:", info.response);
          resolve();
        }
      });
    });
  }
}

export default GiftService;
