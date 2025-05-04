import { Request, Response } from "express";
import WalletService from "./wallet.service";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});
console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);
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
      if (!wallet) return res.status(404).json({ error: "Wallet not found for this user" });
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  }
  static async getWalletById(req: Request, res: Response) {
    try {
      const wallet = await WalletService.getWalletById(req.params.id);
      if (!wallet) return res.status(404).json({ error: "Wallet not found" });
      res.json(wallet);
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
    const { userId, amount, imoneyValue } = req.body;

    console.log("createCheckoutSession - Request body:", {
      userId,
      amount,
      imoneyValue,
    });

    if (!userId || !amount || !imoneyValue) {
      console.log("createCheckoutSession - Missing required fields:", {
        userId,
        amount,
        imoneyValue,
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
        },
        // Make sure we're using the correct URL format that matches our routes
        success_url: `http://localhost:4200/wallets/top-up/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:4200/wallets/top-up/cancel`,
      });

      console.log("createCheckoutSession - Stripe session created:", {
        sessionId: session.id,
        url: session.url,
        metadata: session.metadata,
        success_url: session.success_url, // Log the success URL for debugging
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
      });

      if (session.payment_status === "paid") {
        const userId = session.metadata?.userId;
        const imoneyValue = parseInt(session.metadata?.imoneyValue || "0");

        console.log(
          "handleCheckoutSuccess - Payment successful, processing top-up:",
          {
            userId,
            imoneyValue,
          }
        );

        if (userId && imoneyValue) {
          await WalletService.topUpImoney(userId, imoneyValue);
          console.log(
            "handleCheckoutSuccess - iMoney topped up successfully for user:",
            userId
          );
          res.status(200).json({ message: "iMoney topped up successfully" });
          return;
        } else {
          console.log(
            "handleCheckoutSuccess - Missing userId or imoneyValue in metadata:",
            {
              userId,
              imoneyValue,
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
}

export default WalletController;
