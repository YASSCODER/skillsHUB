import { Router } from "express";
import WalletController from "./wallet.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();

router.get("/", catchAsync(WalletController.getAllWallets));
router.get("/:id", catchAsync(WalletController.getWalletById));
router.get("/user/:userId", catchAsync(WalletController.getWalletByUserId));
router.post("/", catchAsync(WalletController.createWallet));
router.patch("/:id/deactivate", catchAsync(WalletController.deactivateWallet));
router.patch("/:id/activate", catchAsync(WalletController.activateWallet));

router.post("/top-up/create-session", catchAsync(WalletController.createCheckoutSession));
router.get("/top-up/success", catchAsync(WalletController.handleCheckoutSuccess));
router.post("/test-topup", catchAsync(WalletController.testTopUp));
router.post("/test-topup-alt", catchAsync(WalletController.testTopUpAlternative));
router.get("/debug-wallets", catchAsync(WalletController.debugWallets));

// Purchase endpoints
router.post("/purchase/challenge", catchAsync(WalletController.purchaseChallenge));
router.post("/purchase/skill", catchAsync(WalletController.purchaseSkill));

// Manual update endpoint
router.post("/update-all-prices-to-65", catchAsync(WalletController.updateAllPricesToSixtyFive));

// Test email endpoint
router.post("/test-email", catchAsync(WalletController.testEmail));

// Check email configuration
router.get("/check-email-config", catchAsync(WalletController.checkEmailConfig));

// Convert points to iMoney and add to wallet
router.post("/convert-points-to-imoney", catchAsync(WalletController.convertPointsToImoneyAndAddToWallet));

export default router;
