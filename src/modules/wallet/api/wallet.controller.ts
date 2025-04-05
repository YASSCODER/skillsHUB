import { Request, Response } from "express";
import WalletService from "./wallet.service";

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

}

export default WalletController;
