import { Router } from 'express';
import ForumController from "./forum.controllers";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();

router.get('/', catchAsync(ForumController.getAllForums));
router.get('/:id',catchAsync( ForumController.getForumById));
router.post('/', catchAsync(ForumController.createForum));
router.put('/:id', catchAsync(ForumController.updateForum));
router.delete('/:id',catchAsync( ForumController.deleteForum));
router.get("/:forumId/isUserParticipant/:userId", catchAsync(ForumController.isUserParticipant));
router.post("/:forumId/addParticipant/:userId", catchAsync(ForumController.addParticipantToForum));
router.delete("/:forumId/removeParticipant/:userId", catchAsync(ForumController.removeParticipantFromForum));


export default router;
