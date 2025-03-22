import { Router } from "express";
import MarketplaceController from "./Marketplace.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();

router.get("/", catchAsync(MarketplaceController.getAllOffers));
router.get("/:id", catchAsync(MarketplaceController.getofferById));
router.post("/", catchAsync(MarketplaceController.createOffer));
router.put("/:id", catchAsync(MarketplaceController.updateOffer));
router.delete("/:id", catchAsync(MarketplaceController.deleteOffer));
router.get("/offers/filter", MarketplaceController.getOffersByFilter); 

export default router;
