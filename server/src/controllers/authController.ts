import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authenticateUser, registerUser } from "../data/users.js";

const secret = process.env.JWT_SECRET ?? "dev-secret";

export const register = (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  const result = registerUser({ email, name, password });

  if ("error" in result) {
    return res.status(409).json({ message: result.error });
  }

  const { user } = result;
  const token = jwt.sign({ sub: user.email, role: user.role }, secret, { expiresIn: "7d" });

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
  const { email, password } = req.body;
  const user = authenticateUser({ email, password });

  if (!user) {
    return res.status(401).json({ message: "Неверный email или пароль" });
  }

  const token = jwt.sign({ sub: user.email, role: user.role }, secret, { expiresIn: "7d" });

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
