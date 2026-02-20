import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService";
import { ValidationError } from "../utils/errors";

export interface AuthRequest extends Request {
  user?: authService.TokenPayload;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ValidationError("Token manquant");
    }

    const token = authHeader.substring(7);
    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Permission refusée" });
    }

    next();
  };
}