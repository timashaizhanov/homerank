import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { authenticateUser, registerUser } from "../data/users.js";

const secret = process.env.JWT_SECRET ?? "dev-secret";

const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Пароль обязателен")
});

const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .regex(/[A-Z]/, "Нужна хотя бы одна заглавная буква")
    .regex(/[0-9]/, "Нужна хотя бы одна цифра")
});

export const register = (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0]?.message ?? "Некорректные данные" });
  }

  const result = registerUser(parsed.data);

  if ("error" in result) {
    return res.status(409).json({ message: result.error });
  }

  const { user } = result;
  const token = jwt.sign({ sub: user.id, role: user.role }, secret, { expiresIn: "7d" });

  return res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    token
  });
};

export const login = (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0]?.message ?? "Некорректные данные" });
  }

  const user = authenticateUser(parsed.data);

  if (!user) {
    return res.status(401).json({ message: "Неверный email или пароль" });
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, secret, { expiresIn: "7d" });

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    token
  });
};
