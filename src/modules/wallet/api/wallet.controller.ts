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

static async updateWallet(req: Request, res: Response) {
try {
    const updatedWallet = await WalletService.updateWallet(req.params.userId, req.body);
    if (!updatedWallet) return res.status(404).json({ error: "Wallet not found" });
    res.json(updatedWallet);
} catch (error) {
    res.status(500).json({ error: "Failed to update wallet" });
}
}

static async deleteWallet(req: Request, res: Response) {
try {
    const deletedWallet = await WalletService.deleteWallet(req.params.userId);
    if (!deletedWallet) return res.status(404).json({ error: "Wallet not found" });
    res.json({ message: "Wallet deleted successfully" });
} catch (error) {
    res.status(500).json({ error: "Failed to delete wallet" });
}
}
}

export default WalletController;
