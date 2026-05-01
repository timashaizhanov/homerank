import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export interface DemoUserRecord {
  id: string;
  email: string;
  name: string;
  role: "user" | "realtor" | "admin";
  passwordHash: string;
}

const users = new Map<string, DemoUserRecord>();

const hashPassword = (password: string, salt?: string): string => {
  const s = salt ?? randomBytes(16).toString("hex");
  const hash = scryptSync(password, s, 64).toString("hex");
  return `${s}:${hash}`;
};

const verifyPassword = (password: string, stored: string): boolean => {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const derivedHash = scryptSync(password, salt, 64);
    return timingSafeEqual(Buffer.from(hash, "hex"), derivedHash);
  } catch {
    return false;
  }
};

const seedUsers: Array<{ id: string; email: string; name: string; role: DemoUserRecord["role"]; password: string }> = [
  { id: "admin@qala.kz", email: "admin@qala.kz", name: "Qala Admin", role: "admin", password: "Admin12345!" },
  { id: "realtor@qala.kz", email: "realtor@qala.kz", name: "Demo Realtor", role: "realtor", password: "Realtor123!" }
];

for (const seed of seedUsers) {
  users.set(seed.email.toLowerCase(), {
    id: seed.id,
    email: seed.email,
    name: seed.name,
    role: seed.role,
    passwordHash: hashPassword(seed.password)
  });
}

export const findUserByEmail = (email: string) => users.get(email.toLowerCase()) ?? null;

export const registerUser = (payload: { email: string; name: string; password: string }) => {
  const normalizedEmail = payload.email.toLowerCase();

  if (users.has(normalizedEmail)) {
    return { error: "Пользователь с таким email уже существует" } as const;
  }

  const user: DemoUserRecord = {
    id: createHash("sha256").update(normalizedEmail).digest("hex").slice(0, 16),
    email: normalizedEmail,
    name: payload.name,
    role: "user",
    passwordHash: hashPassword(payload.password)
  };

  users.set(normalizedEmail, user);
  return { user } as const;
};

export const authenticateUser = (payload: { email: string; password: string }) => {
  const user = findUserByEmail(payload.email);

  if (!user || !verifyPassword(payload.password, user.passwordHash)) {
    return null;
  }

  return user;
};
