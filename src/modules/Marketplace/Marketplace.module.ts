import { Router } from "express";
import MarketplaceRoutes from "./api/Marketplace.routes";

const MarketplaceModule: { path: string; handler: Router } = {

  path: "/marketplace",
  handler: MarketplaceRoutes,
};

export default MarketplaceModule;
