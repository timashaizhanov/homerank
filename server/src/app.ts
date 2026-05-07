import cors from "cors";
import express from "express";
import propertyRoutes from "./routes/propertyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import environmentRoutes from "./routes/environmentRoutes.js";

export const createApp = () => {
  const app = express();
  const allowedOrigins = [
    process.env.CLIENT_URL ?? "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5173"
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("CORS blocked"));
      }
    })
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "home-rank-api",
      date: new Date().toISOString()
    });
  });

  app.use("/api/properties", propertyRoutes);
  app.use("/api/locations", locationRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/environment", environmentRoutes);

  return app;
};
