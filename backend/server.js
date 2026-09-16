import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./src/db.js";
import shiftRoutes from "./src/routes/shifts.js";
import categoryRoutes from "./src/routes/categories.js";
import analyticsRoutes from "./src/routes/analytics.js";

const PORT = process.env.PORT || 5050;

async function main() {
  await connectDB();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/shifts", shiftRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/analytics", analyticsRoutes);

  app.listen(PORT, () => {
    console.log(`[api] listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
