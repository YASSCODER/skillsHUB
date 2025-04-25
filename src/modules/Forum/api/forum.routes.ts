import { Router } from 'express';
import ForumController from "./forum.controllers";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();

router.get('/', catchAsync(ForumController.getAllForums));
router.get('/:id',catchAsync( ForumController.getForumById));
router.post('/', catchAsync(ForumController.createForum));
router.put('/:id', catchAsync(ForumController.updateForum));
router.delete('/:id',catchAsync( ForumController.deleteForum));
router.post("/:forumId/rate/:userId", catchAsync(ForumController.rateForum));
router.get("/byUser/:userId", catchAsync(ForumController.getForumsByUser));

export default router;
