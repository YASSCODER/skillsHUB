import { Router } from "express";
import CategoryController from "./Category.controller";
import catchAsync from "../../../common/utils/catch-async.utils";

const router = Router();

router.get("/all/", catchAsync(CategoryController.getAllCategory));
router.get("/:id", catchAsync(CategoryController.getCategoryById));
router.post("/create/", catchAsync(CategoryController.createCategory));
router.put("/:id", catchAsync(CategoryController.updateCategory));
router.delete("/:id", catchAsync(CategoryController.deleteCategory));

export default router;
