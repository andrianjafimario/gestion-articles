import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../utils/database";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-prod";
const JWT_EXPIRY = "24h";

export interface TokenPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "EDITOR";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new ValidationError("Token invalide ou expiré");
  }
}

export async function register(
  email: string,
  password: string
): Promise<{ user: any; token: string }> {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ConflictError("Cet email est déjà utilisé");
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "EDITOR", // Par défaut, nouvel utilisateur = EDITOR
    },
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role as "ADMIN" | "EDITOR",
  });

  return { user: { id: user.id, email: user.email, role: user.role }, token };
}

export async function login(
  email: string,
  password: string
): Promise<{ user: any; token: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new NotFoundError("Utilisateur non trouvé");
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new ValidationError("Identifiants invalides");
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role as "ADMIN" | "EDITOR",
  });

  return { user: { id: user.id, email: user.email, role: user.role }, token };
}