import { Request, Response } from "express";
import WalletService from "./wallet.service";
import Stripe from "stripe";
import dotenv from "dotenv";
import { WalletEmailService } from "../services/wallet-email.service";
import UserService from "../../user/api/user.service";
import RewardsService from "../../reward/api/reward.service";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
apiVersion: "2025-03-31.basil",
}); // Updated API version
// console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);

class WalletController {
  static async getAllWallets(req: Request, res: Response) {
    try {
      const wallets = await WalletService.getAllWallets();
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallets" });
    }
  }

  static async getWalletByUserId(req: Request, res: Response) {
    try {
      const wallet = await WalletService.getWalletByUserId(req.params.userId);
      res.json(wallet || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  }
  static async getWalletById(req: Request, res: Response) {
    try {
      const wallet = await WalletService.getWalletById(req.params.id);
      res.json(wallet || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  }
  static async createWallet(req: Request, res: Response) {
    console.log("Create wallet request body:", req.body);
    try {
      const newWallet = await WalletService.createWallet(req.body);
      console.log("New wallet:", newWallet);
      res.status(201).json(newWallet);
    } catch (error) {
      console.error("Failed to create wallet:", error);
      res.status(500).json({ error: "Failed to create wallet" });
    }
  }

  static async deactivateWallet(req: Request, res: Response) {
    try {
      const wallet = await WalletService.deactivateWallet(req.params.id);
      return res.status(200).json({ message: "Wallet deactivated", wallet });
    } catch (error) {
      return res.status(500).json({ error: "Failed to deactivate wallet" });
    }
  }

  static async activateWallet(req: Request, res: Response) {
    try {
      const wallet = await WalletService.activateWallet(req.params.id);
      return res.status(200).json({ message: "Wallet activated", wallet });
    } catch (error: any) {
      if (
        error.message ===
        "You can only activate the wallet after 48 hours of deactivation"
      ) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to activate wallet" });
    }
  }
  static async createCheckoutSession(req: Request, res: Response) {
    const { userId, amount, imoneyValue, packageName, points } = req.body;

    console.log("=== CREATE CHECKOUT SESSION DEBUG START ===");
    console.log("createCheckoutSession - Request body:", {
      userId,
      amount,
      imoneyValue,
      packageName,
    });
    console.log("createCheckoutSession - Package details:", {
      packageName: packageName || "Unknown Package",
      stripeAmount: amount,
      imoneyToAdd: imoneyValue,
      note: "amount is what user pays, imoneyValue is what gets added to wallet"
    });

    if (!userId || !amount || !imoneyValue) {
      console.log("createCheckoutSession - Missing required fields:", {
        userId,
        amount,
        imoneyValue,
        packageName,
      });
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Check if the wallet is active
      const wallet = await WalletService.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      if (!wallet.isActive) {
        return res.status(400).json({ error: "Cannot top up a deactivated wallet" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `iMoney Top-Up (${imoneyValue} iMoney)`,
              },
              unit_amount: amount * 100, // Stripe expects amount in cents
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId,
          imoneyValue: imoneyValue.toString(),
          packageName: packageName || "Unknown Package",
          amount: amount.toString(),
          points: points?.toString() || "0",
        },
        // Make sure we're using the correct URL format that matches our routes
        success_url: `http://localhost:4200/wallets/top-up/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:4200/wallets/top-up/cancel`,
      });

      console.log("createCheckoutSession - Stripe session created:", {
        sessionId: session.id,
        url: session.url,
        metadata: session.metadata,
        success_url: session.success_url,
        userId_in_metadata: session.metadata?.userId,
        imoneyValue_in_metadata: session.metadata?.imoneyValue,
      });

      res.status(200).json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
      console.error(
        "createCheckoutSession - Error creating Stripe checkout session:",
        {
          error: error.message,
          stack: error.stack,
        }
      );
      res
        .status(500)
        .json({ error: error.message || "Failed to create checkout session" });
    }
  }

  static async handleCheckoutSuccess(req: Request, res: Response) {
    const { session_id } = req.query;

    console.log("=== CHECKOUT SUCCESS DEBUG START ===");
    console.log("handleCheckoutSuccess - Session ID from query:", session_id);

    if (!session_id) {
      console.log("handleCheckoutSuccess - Missing session ID");
      return res.status(400).json({ error: "Missing session ID" });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(
        session_id as string
      );

      console.log("handleCheckoutSuccess - Retrieved Stripe session:", {
        sessionId: session.id,
        payment_status: session.payment_status,
        metadata: session.metadata,
        amount_total: session.amount_total,
      });

      if (session.payment_status === "paid") {
        const userId = session.metadata?.userId;
        const imoneyValue = parseInt(session.metadata?.imoneyValue || "0");
        const customPoints = parseInt(session.metadata?.points || "0");

        console.log(
          "handleCheckoutSuccess - Payment successful, processing top-up:",
          {
            userId,
            imoneyValue,
            customPoints,
            metadataRaw: session.metadata,
          }
        );

        if (userId && imoneyValue > 0) {
          console.log("handleCheckoutSuccess - Before wallet update, checking current wallet...");

          // Get current wallet state before update
          const currentWallet = await WalletService.getWalletByUserId(userId);
          console.log("handleCheckoutSuccess - Current wallet before update:", {
            walletId: currentWallet?._id,
            currentBalance: (currentWallet?.imoney as any)?.value,
            imoneyId: (currentWallet?.imoney as any)?._id,
          });

          const updatedWallet = await WalletService.topUpImoney(userId, imoneyValue);

          console.log(
            "handleCheckoutSuccess - iMoney topped up successfully for user:",
            userId,
            "Previous balance:",
            (currentWallet?.imoney as any)?.value,
            "Added amount:",
            imoneyValue,
            "New wallet balance:",
            (updatedWallet?.imoney as any)?.value
          );

          // Award points for wallet top-up
          try {
            console.log("handleCheckoutSuccess - Awarding points for top-up...");
            const packageName = session.metadata?.packageName || "Unknown Package";

            let pointsResult;
            if (customPoints > 0) {
              // Use custom points from package
              console.log("handleCheckoutSuccess - Using custom points from package:", customPoints);
              pointsResult = await RewardsService.earnCustomPointsForTopUp(
                userId,
                (updatedWallet?._id as any)?.toString() || currentWallet?._id?.toString() || "unknown",
                customPoints,
                packageName,
                session.id
              );
            } else {
              // Fallback to legacy calculation
              console.log("handleCheckoutSuccess - Using legacy points calculation");
              pointsResult = await RewardsService.earnPointsForTopUp(
                userId,
                (updatedWallet?._id as any)?.toString() || currentWallet?._id?.toString() || "unknown",
                imoneyValue,
                session.id
              );
            }

            console.log("handleCheckoutSuccess - Points awarded:", {
              pointsEarned: pointsResult.points,
              method: customPoints > 0 ? 'custom' : 'legacy',
              customPoints: customPoints,
              packageName: packageName
            });
          } catch (pointsError: any) {
            console.error("handleCheckoutSuccess - Failed to award points:", pointsError?.message);
            // Don't fail the entire request if points fail
          }

          // Send email notification
          try {
            console.log("handleCheckoutSuccess - Starting email notification process...");
            console.log("handleCheckoutSuccess - User ID for email lookup:", userId);

            // Get user information for email
            const userService = new UserService();
            const user = await userService.getUserById(userId);

            console.log("handleCheckoutSuccess - User lookup result:", {
              found: !!user,
              hasEmail: !!(user && user.email),
              userEmail: user?.email,
              userName: user?.fullName,
            });

            // Try to send email if user has email, or use fallback for testing
            const userEmail = user?.email || "test@example.com"; // Fallback for testing
            const userName = user?.fullName || "Valued Customer";

            if (userEmail) {
              const packageName = session.metadata?.packageName || "Unknown Package";
              const amountPaid = parseFloat(session.metadata?.amount || "0");

              const emailData = {
                userEmail: userEmail,
                userName: userName,
                packageName: packageName,
                amountPaid: amountPaid,
                imoneyReceived: imoneyValue,
                newBalance: (updatedWallet?.imoney as any)?.value,
                transactionId: session.id,
              };

              console.log("handleCheckoutSuccess - About to send email with data:", emailData);

              const emailResult = await WalletEmailService.sendTopUpConfirmationEmail(emailData);
              console.log("handleCheckoutSuccess - Email sent successfully:", emailResult);
            } else {
              console.log("handleCheckoutSuccess - Cannot send email - No email address available");
              console.log("handleCheckoutSuccess - User object:", user);
            }
          } catch (emailError: any) {
            console.error("handleCheckoutSuccess - Failed to send email notification:", emailError);
            console.error("handleCheckoutSuccess - Email error stack:", emailError?.stack);
            // Don't fail the entire request if email fails
          }

          console.log("=== CHECKOUT SUCCESS DEBUG END ===");

          res.status(200).json({
            message: "iMoney topped up successfully",
            wallet: updatedWallet,
            debug: {
              previousBalance: (currentWallet?.imoney as any)?.value,
              addedAmount: imoneyValue,
              newBalance: (updatedWallet?.imoney as any)?.value
            }
          });
          return;
        } else {
          console.log(
            "handleCheckoutSuccess - Missing userId or invalid imoneyValue:",
            {
              userId,
              imoneyValue,
              metadataRaw: session.metadata,
            }
          );
          res
            .status(400)
            .json({ error: "User or amount not found in session metadata" });
          return;
        }
      } else {
        console.log("handleCheckoutSuccess - Payment not successful:", {
          payment_status: session.payment_status,
        });
        res.status(400).json({ error: "Payment not successful" });
        return;
      }
    } catch (error: any) {
      console.error("handleCheckoutSuccess - Error retrieving session:", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: "Failed to retrieve session" });
    }
  }

  // Test endpoint to manually test wallet top-up
  static async testTopUp(req: Request, res: Response) {
    const { userId, imoneyValue } = req.body;

    console.log("=== TEST TOP UP START ===");
    console.log("testTopUp - Input:", { userId, imoneyValue });
    console.log("testTopUp - This will update the wallet for the specified user ID");

    if (!userId || !imoneyValue) {
      return res.status(400).json({ error: "Missing userId or imoneyValue" });
    }

    try {
      // Get current wallet state
      const currentWallet = await WalletService.getWalletByUserId(userId);
      console.log("testTopUp - Current wallet:", {
        exists: !!currentWallet,
        walletId: currentWallet?._id,
        currentBalance: (currentWallet?.imoney as any)?.value,
        imoneyId: (currentWallet?.imoney as any)?._id,
      });

      if (!currentWallet) {
        return res.status(404).json({ error: "Wallet not found for user" });
      }

      // Perform the top-up using imoneyValue (this is what gets added to the wallet)
      const updatedWallet = await WalletService.topUpImoney(userId, imoneyValue);

      console.log("testTopUp - Update result:", {
        success: !!updatedWallet,
        newBalance: (updatedWallet?.imoney as any)?.value,
      });
      console.log("=== TEST TOP UP END ===");

      res.status(200).json({
        message: "Test top-up successful",
        before: (currentWallet?.imoney as any)?.value,
        addedImoneyValue: imoneyValue,
        after: (updatedWallet?.imoney as any)?.value,
        wallet: updatedWallet
      });
    } catch (error: any) {
      console.error("testTopUp - Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  // Test endpoint using alternative method
  static async testTopUpAlternative(req: Request, res: Response) {
    const { userId, imoneyValue } = req.body;

    console.log("=== TEST ALTERNATIVE TOP UP START ===");
    console.log("testTopUpAlternative - Input:", { userId, imoneyValue });

    if (!userId || !imoneyValue) {
      return res.status(400).json({ error: "Missing userId or imoneyValue" });
    }

    try {
      // Get current wallet state
      const currentWallet = await WalletService.getWalletByUserId(userId);
      console.log("testTopUpAlternative - Current wallet:", {
        exists: !!currentWallet,
        currentBalance: (currentWallet?.imoney as any)?.value,
      });

      if (!currentWallet) {
        return res.status(404).json({ error: "Wallet not found for user" });
      }

      // Perform the top-up using alternative method
      const updatedWallet = await WalletService.topUpImoneyAlternative(userId, imoneyValue);

      console.log("testTopUpAlternative - Update result:", {
        success: !!updatedWallet,
        newBalance: (updatedWallet?.imoney as any)?.value,
      });
      console.log("=== TEST ALTERNATIVE TOP UP END ===");

      res.status(200).json({
        message: "Alternative test top-up successful",
        before: (currentWallet?.imoney as any)?.value,
        addedImoneyValue: imoneyValue,
        after: (updatedWallet?.imoney as any)?.value,
        wallet: updatedWallet
      });
    } catch (error: any) {
      console.error("testTopUpAlternative - Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  // Debug endpoint to check all wallets and find the correct user ID
  static async debugWallets(req: Request, res: Response) {
    console.log("=== DEBUG WALLETS START ===");

    try {
      const allWallets = await WalletService.getAllWallets();

      console.log("debugWallets - Found wallets:", allWallets.length);

      const walletInfo = allWallets.map(wallet => ({
        walletId: wallet._id,
        userId: (wallet.user as any)?._id || wallet.user,
        userEmail: (wallet.user as any)?.email,
        userName: (wallet.user as any)?.fullName,
        imoneyId: (wallet.imoney as any)?._id,
        imoneyValue: (wallet.imoney as any)?.value,
        currencyType: (wallet.imoney as any)?.currencyType,
        isActive: wallet.isActive,
      }));

      console.log("debugWallets - Wallet details:", JSON.stringify(walletInfo, null, 2));
      console.log("=== DEBUG WALLETS END ===");

      res.status(200).json({
        message: "Debug info retrieved",
        totalWallets: allWallets.length,
        wallets: walletInfo
      });
    } catch (error: any) {
      console.error("debugWallets - Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

  // Purchase challenge with iMoney
  // Note: imoneyPrice is now passed in request body since it's removed from schema
  static async purchaseChallenge(req: Request, res: Response) {
    const { userId, challengeId, imoneyPrice } = req.body;

    console.log("=== PURCHASE CHALLENGE CONTROLLER START ===");
    console.log("purchaseChallenge - Input:", { userId, challengeId, imoneyPrice });

    if (!userId || !challengeId || !imoneyPrice) {
      return res.status(400).json({ error: "Missing required fields: userId, challengeId, imoneyPrice" });
    }

    try {
      const result = await WalletService.purchaseChallenge(userId, challengeId, imoneyPrice);

      console.log("purchaseChallenge - Purchase successful:", {
        challengeId,
        amountDeducted: imoneyPrice,
        newBalance: result.transaction.newBalance,
      });

      // Award points for challenge purchase
      try {
        console.log("purchaseChallenge - Awarding points for challenge purchase...");
        const pointsResult = await RewardsService.earnPointsForChallengePurchase(
          userId,
          (result.wallet?._id as any)?.toString() || "unknown",
          challengeId,
          imoneyPrice
        );
        console.log("purchaseChallenge - Points awarded:", {
          pointsEarned: pointsResult.points,
          totalPoints: pointsResult.points
        });
      } catch (pointsError: any) {
        console.error("purchaseChallenge - Failed to award points:", pointsError?.message);
        // Don't fail the entire request if points fail
      }

      res.status(200).json({
        message: "Challenge purchased successfully",
        challengeId,
        amountDeducted: imoneyPrice,
        newBalance: result.transaction.newBalance,
        wallet: result.wallet,
        transaction: result.transaction
      });
    } catch (error: any) {
      console.error("purchaseChallenge - Error:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  // Purchase skill with iMoney
  // Note: imoneyPrice is now passed in request body since it's removed from schema
  static async purchaseSkill(req: Request, res: Response) {
    const { userId, skillId, imoneyPrice } = req.body;

    console.log("=== PURCHASE SKILL CONTROLLER START ===");
    console.log("purchaseSkill - Input:", { userId, skillId, imoneyPrice });

    if (!userId || !skillId || !imoneyPrice) {
      return res.status(400).json({ error: "Missing required fields: userId, skillId, imoneyPrice" });
    }

    try {
      const result = await WalletService.purchaseSkill(userId, skillId, imoneyPrice);

      console.log("purchaseSkill - Purchase successful:", {
        skillId,
        amountDeducted: imoneyPrice,
        newBalance: result.transaction.newBalance,
      });

      // Award points for skill purchase
      try {
        console.log("purchaseSkill - Awarding points for skill purchase...");
        const pointsResult = await RewardsService.earnPointsForSkillPurchase(
          userId,
          (result.wallet?._id as any)?.toString() || "unknown",
          skillId,
          imoneyPrice
        );
        console.log("purchaseSkill - Points awarded:", {
          pointsEarned: pointsResult.points,
          totalPoints: pointsResult.points
        });
      } catch (pointsError: any) {
        console.error("purchaseSkill - Failed to award points:", pointsError?.message);
        // Don't fail the entire request if points fail
      }

      res.status(200).json({
        message: "Skill purchased successfully",
        skillId,
        amountDeducted: imoneyPrice,
        newBalance: result.transaction.newBalance,
        wallet: result.wallet,
        transaction: result.transaction
      });
    } catch (error: any) {
      console.error("purchaseSkill - Error:", error.message);
      res.status(400).json({ error: error.message });
    }
  }

  // Manual endpoint to update all skills and challenges to have imoneyPrice = 65
  static async updateAllPricesToSixtyFive(req: Request, res: Response) {
    console.log("=== DEPRECATED ENDPOINT CALLED ===");

    try {
      const result = await WalletService.updateAllPricesToSixtyFive();

      console.log("Manual update completed successfully:", result);

      res.status(200).json({
        message: "Successfully updated all skills and challenges to 65 iMoney",
        result: {
          skillsUpdated: result.skillsUpdated,
          challengesUpdated: result.challengesUpdated,
          totalSkills: result.totalSkills,
          totalChallenges: result.totalChallenges
        }
      });
    } catch (error: any) {
      console.error("Manual update failed:", error.message);
      res.status(500).json({
        error: "Failed to update prices",
        details: error.message
      });
    }
  }

  // Test email endpoint
  static async testEmail(req: Request, res: Response) {
    console.log("=== TEST EMAIL ENDPOINT ===");

    try {
      const { userEmail, userName } = req.body;

      if (!userEmail) {
        return res.status(400).json({ error: "userEmail is required" });
      }

      const testEmailData = {
        userEmail: userEmail,
        userName: userName || "Test User",
        packageName: "Premium Package (Test)",
        amountPaid: 50,
        imoneyReceived: 65,
        newBalance: 215,
        transactionId: "test_session_123456",
      };

      console.log("testEmail - Sending test email with data:", testEmailData);

      const emailResult = await WalletEmailService.sendTopUpConfirmationEmail(testEmailData);

      console.log("testEmail - Email result:", emailResult);

      res.status(200).json({
        message: "Test email sent successfully",
        emailData: testEmailData,
        result: emailResult
      });
    } catch (error: any) {
      console.error("testEmail - Error:", error);
      res.status(500).json({
        error: "Failed to send test email",
        details: error.message
      });
    }
  }

  // Check email configuration
  static async checkEmailConfig(req: Request, res: Response) {
    console.log("=== EMAIL CONFIG CHECK ===");

    const config = {
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS,
      emailUserValue: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***` : 'Not set',
      // Legacy check
      hasMailUser: !!process.env.MAIL_USER,
      hasMailPassword: !!process.env.MAIL_PASSWORD,
    };

    console.log("Email configuration:", config);

    res.status(200).json({
      message: "Email configuration check",
      config: config
    });
  }

  // Convert points to iMoney and add to wallet
  static async convertPointsToImoneyAndAddToWallet(req: Request, res: Response) {
    const { userId, points } = req.body;

    console.log("=== CONVERT POINTS TO IMONEY AND ADD TO WALLET ===");
    console.log("convertPointsToImoneyAndAddToWallet - Input:", { userId, points });

    if (!userId || !points) {
      return res.status(400).json({ error: "Missing required fields: userId, points" });
    }

    try {
      // Get user's wallet
      const wallet = await WalletService.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found for user" });
      }

      // Convert points to iMoney (this deducts points)
      const conversionResult = await RewardsService.convertPointsToImoney(
        userId,
        points,
        (wallet._id as any)?.toString() || "unknown"
      );

      // Add the converted iMoney to the wallet
      const updatedWallet = await WalletService.topUpImoney(userId, conversionResult.imoneyToAdd);

      console.log("convertPointsToImoneyAndAddToWallet - Conversion and wallet update successful:", {
        pointsDeducted: conversionResult.pointsDeducted,
        imoneyAdded: conversionResult.imoneyToAdd,
        newWalletBalance: (updatedWallet?.imoney as any)?.value,
        remainingPoints: conversionResult.remainingPoints
      });

      res.status(200).json({
        message: "Points converted to iMoney and added to wallet successfully",
        pointsDeducted: conversionResult.pointsDeducted,
        imoneyAdded: conversionResult.imoneyToAdd,
        newWalletBalance: (updatedWallet?.imoney as any)?.value,
        remainingPoints: conversionResult.remainingPoints,
        conversionRate: conversionResult.conversionRate,
        wallet: updatedWallet
      });
    } catch (error: any) {
      console.error("convertPointsToImoneyAndAddToWallet - Error:", error.message);
      res.status(400).json({ error: error.message });
    }
  }
}

export default WalletController;