import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET ?? "dev-secret";

export interface AuthenticatedRequest extends Request {
  auth?: {
    sub: string;
    role: string;
  };
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  try {
    const decoded = jwt.verify(token, secret) as { sub: string; role: string };

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Доступ только для администратора" });
    }

    (req as AuthenticatedRequest).auth = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Сессия недействительна" });
  }
};
