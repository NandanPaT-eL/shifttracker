import express from "express";
import cors from "cors";
import shiftRoutes from "./routes/shifts.js";
import categoryRoutes from "./routes/categories.js";
import analyticsRoutes from "./routes/analytics.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: "*" }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/shifts", shiftRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/analytics", analyticsRoutes);

  return app;
}
