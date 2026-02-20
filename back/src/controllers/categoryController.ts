import { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/categoryService";
import { CreateCategorySchema, UpdateCategorySchema } from "../schemas/validation";

export async function listCategories(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validatedData = CreateCategorySchema.parse(req.body);
    const category = await categoryService.createCategory(validatedData);
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const validatedData = UpdateCategorySchema.parse(req.body);
    const category = await categoryService.updateCategory(id, validatedData);
    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const category = await categoryService.deleteCategory(id);
    res.json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
}
