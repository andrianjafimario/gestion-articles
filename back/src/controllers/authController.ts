import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as authService from "../services/authService";
import { RegisterSchema, LoginSchema } from "../schemas/authSchemas";
import { ValidationError } from "../utils/errors";

export async function register(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = RegisterSchema.parse(req.body);
    const result = await authService.register(data.email, data.password);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = LoginSchema.parse(req.body);
    const result = await authService.login(data.email, data.password);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new ValidationError("Non authentifié");
    }
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
}