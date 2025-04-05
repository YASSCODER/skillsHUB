import { Router } from "express";
import WalletController from "./wallet.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();

router.get("/", catchAsync(WalletController.getAllWallets));
router.get("/:id", catchAsync(WalletController.getWalletByUserId));
router.post("/", catchAsync(WalletController.createWallet));
router.patch("/:id/deactivate", catchAsync(WalletController.deactivateWallet));
router.patch("/:id/activate", catchAsync(WalletController.activateWallet));

export default router;
