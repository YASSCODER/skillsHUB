import { Router } from "express";
import CommunityController from './community.controller';
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();

// Routes CRUD
router.get("/", catchAsync(CommunityController.getAllCommunities));

// Assurez-vous que cette route est AVANT la route :id
router.get('/search', catchAsync(CommunityController.searchCommunities));

// Route pour obtenir une communauté par ID
router.get("/:id", catchAsync(CommunityController.getCommunityById));

router.post("/", catchAsync(CommunityController.createCommunity));
router.put("/:id", catchAsync(CommunityController.updateCommunity));
router.delete("/:id", catchAsync(CommunityController.deleteCommunity));

// Routes pour la gestion des membres
router.get("/:idCommunity/isUserMember/:idUser", catchAsync(CommunityController.isUserMember));
router.post("/:idCommunity/addMember/:idUser", catchAsync(CommunityController.addMemberToCommunity));
router.delete("/:idCommunity/removeMember/:idUser", catchAsync(CommunityController.removeMemberFromCommunity));

export default router;
