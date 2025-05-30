import { Router } from "express";
import CommunityController from "./community.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();

// Routes CRUD
router.get("/count", catchAsync(CommunityController.countCommunities));
router.get("/", catchAsync(CommunityController.getAllCommunities));
router.get("/search", catchAsync(CommunityController.searchCommunities));
router.get("/:id", catchAsync(CommunityController.getCommunityById));
router.post("/", catchAsync(CommunityController.createCommunity));
router.put("/:id", catchAsync(CommunityController.updateCommunity));
router.delete("/:id", catchAsync(CommunityController.deleteCommunity));

// Routes pour la gestion des membres
router.get(
  "/:idCommunity/isUserMember/:idUser",
  catchAsync(CommunityController.isUserMember)
);

// Route pour récupérer les membres d'une communauté
router.get("/:communityId/members", (req, res) => {
  console.log("Get community members route called");
  CommunityController.getCommunityMembers(req, res);
});

// Routes pour les membres (sans catchAsync pour déboguer)
router.post("/:communityId/members/:userId", (req, res) => {
  console.log("Route handler called");
  CommunityController.addMember(req, res);
});

router.delete("/:communityId/members/:userId", (req, res) => {
  console.log("Remove member route handler called");
  CommunityController.removeMember(req, res);
});

// Anciennes routes
// router.post("/:idCommunity/addMember/:idUser", catchAsync(CommunityController.addMemberToCommunity));
// router.delete("/:idCommunity/removeMember/:idUser", catchAsync(CommunityController.removeMemberFromCommunity));

export default router;
