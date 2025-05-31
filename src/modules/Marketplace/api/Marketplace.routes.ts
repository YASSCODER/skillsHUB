import { Router } from "express";
import MarketplaceController from "./Marketplace.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();

router.get("/", catchAsync(MarketplaceController.getAllSkills));
router.get("/by-ids", catchAsync(MarketplaceController.getSkillsByIds));
router.get("/skills/:id", catchAsync(MarketplaceController.getSkillById));
router.post("/", catchAsync(MarketplaceController.createSkill));
router.put("/updateSkill/:id", catchAsync(MarketplaceController.updateSkill));
router.delete(
  "/deleteSkill/:id",
  catchAsync(MarketplaceController.deleteSkill)
);
router.get("/matchSkills/", catchAsync(MarketplaceController.matchSkills));
router.get(
  "/findUsersWithSkill/",
  catchAsync(MarketplaceController.findUsersWithSkill)
);
router.get(
  "/getSkillsByCategory/",
  catchAsync(MarketplaceController.getSkillsByCategory)
);
router.post(
  "/:userId/verify-github",
  catchAsync(MarketplaceController.verifyGitHubSkills)
);
router.get("/check-skill", catchAsync(MarketplaceController.checkSkill));
export default router;
