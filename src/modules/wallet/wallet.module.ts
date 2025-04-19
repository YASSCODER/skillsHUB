import { Router } from "express";
import walletRoutes from "./api/wallet.routes";

const WalletModule: { path: string; handler: Router } = {
  path: "/wallets",
  handler: walletRoutes,
};

export default WalletModule;
