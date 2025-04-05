import { Request, Response } from "express";
import WalletService from "./wallet.service";
import Stripe from "stripe";
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',
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
            return res.status(404).json({ error: "Failed to deactivate wallet" });
        }
    }

    static async activateWallet(req: Request, res: Response) {
        try {
            const wallet = await WalletService.activateWallet(req.params.id);
            return res.status(200).json({ message: "Wallet activated", wallet });
        } catch (error) {
            return res.status(404).json({ error: "Failed to activate wallet" });
        }
    }

    static async createCheckoutSession(req: Request, res: Response) {
        const { userId, amount, imoneyValue } = req.body;

        if (!userId || !amount || !imoneyValue) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `Top-Up: ${imoneyValue} iMoney`,
                            },
                            unit_amount: amount * 100,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.CORS_ORIGIN}/wallet/top-up/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CORS_ORIGIN}/wallet/top-up/cancel`,
                metadata: {
                    userId,
                    imoneyValue: imoneyValue.toString(),
                },
            });

            res.status(200).json({ url: session.url, sessionId: session.id });

        } catch (error) {
            console.error('Error creating Stripe checkout session', error);
            res.status(500).json({ error: 'Failed to create checkout session' });
        }
    }

    static async handleCheckoutSuccess(req: Request, res: Response) {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ error: "Missing session ID" });
        }

        try {
            const session = await stripe.checkout.sessions.retrieve(session_id as string);

            if (session.payment_status === 'paid') {
                const userId = session.metadata?.userId;
                const imoneyValue = parseInt(session.metadata?.imoneyValue || "0");

                if (userId && imoneyValue) {
                    await WalletService.topUpImoney(userId, imoneyValue);
                    res.status(200).json({ message: "iMoney topped up successfully" });
                    return;
                } else {
                    res.status(400).json({ error: "User or amount not found in session metadata" });
                    return;
                }
            } else {
                res.status(400).json({ error: "Payment not successful" });
                return;
            }
        } catch (error) {
            console.error("Error retrieving session", error);
            res.status(500).json({ error: "Failed to retrieve session" });
        }

    }

}

export default WalletController;
