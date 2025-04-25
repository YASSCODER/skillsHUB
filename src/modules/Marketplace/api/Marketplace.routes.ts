import { Router } from "express";
import MarketplaceController from "./Marketplace.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();



router.get("/all/", catchAsync(MarketplaceController.getAllSkills));
router.get("/getSkillById/:id", catchAsync(MarketplaceController.getSkillById));
router.post("/createSkill/", catchAsync(MarketplaceController.createSkill));
router.put("/updateSkill/:id", catchAsync(MarketplaceController.updateSkill));
router.delete("/deleteSkill/:id", catchAsync(MarketplaceController.deleteSkill));
router.get("/matchSkills/", catchAsync(MarketplaceController.matchSkills)); 
router.get("/findUsersWithSkill/", catchAsync(MarketplaceController.findUsersWithSkill));
router.get("/getSkillsByCategory/", catchAsync(MarketplaceController.getSkillsByCategory));
router.post('/:userId/verify-github', catchAsync(MarketplaceController.verifyGitHubSkills));
router.get('/check-skill', catchAsync(MarketplaceController.checkSkill));

export default router;
