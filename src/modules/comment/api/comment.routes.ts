import { Router } from "express";
import catchAsync from "../../../common/utils/catch-async.utils";
import CommentController from "./comment.controller";


const router = Router();

router.get("/", catchAsync(CommentController.getAllComments));
router.get("/:id", catchAsync(CommentController.getCommentById));
router.post("/", catchAsync(CommentController.createComment));
router.put("/:id", catchAsync(CommentController.updateComment));
router.delete("/:id", catchAsync(CommentController.deleteComment));

export default router;
