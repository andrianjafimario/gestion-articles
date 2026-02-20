import { Router } from "express";
import * as categoryController from "../controllers/categoryController";

const router = Router();

// GET /api/categories - List all categories
router.get("/", categoryController.listCategories);

// POST /api/categories - Create category
router.post("/", categoryController.createCategory);

// GET /api/categories/:id - Get category by id
router.get("/:id", categoryController.getCategory);

// PUT /api/categories/:id - Update category
router.put("/:id", categoryController.updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete("/:id", categoryController.deleteCategory);

export default router;
