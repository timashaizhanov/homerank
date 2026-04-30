export interface DemoUserRecord {
  id: string;
  email: string;
  name: string;
  role: "user" | "realtor" | "admin";
  password: string;
}

const users = new Map<string, DemoUserRecord>();

const seedUsers: DemoUserRecord[] = [
  {
    id: "admin@qala.kz",
    email: "admin@qala.kz",
    name: "Qala Admin",
    role: "admin",
    password: process.env.DEMO_ADMIN_PASSWORD
  },
  {
    id: "realtor@qala.kz",
    email: "realtor@qala.kz",
    name: "Demo Realtor",
    role: "realtor",
    password: process.env.DEMO_REALTOR_PASSWORD
  }
];

for (const user of seedUsers) {
  users.set(user.email.toLowerCase(), user);
}

export const findUserByEmail = (email: string) => users.get(email.toLowerCase()) ?? null;

export const registerUser = (payload: { email: string; name: string; password: string }) => {
  const normalizedEmail = payload.email.toLowerCase();

  if (users.has(normalizedEmail)) {
    return { error: "Пользователь с таким email уже существует" } as const;
  }

  const user: DemoUserRecord = {
    id: normalizedEmail,
    email: normalizedEmail,
    name: payload.name,
    role: "user",
    password: payload.password
  };

  users.set(normalizedEmail, user);
  return { user } as const;
};

export const authenticateUser = (payload: { email: string; password: string }) => {
  const user = findUserByEmail(payload.email);

  if (!user || user.password !== payload.password) {
    return null;
  }

  return user;
};
