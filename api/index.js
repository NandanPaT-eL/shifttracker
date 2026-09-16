// Vercel serverless entry point — wraps the Express app as a single function.
// Connection is cached across warm invocations to avoid reconnecting on every request.
import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "../backend/src/db.js";
import shiftRoutes from "../backend/src/routes/shifts.js";
import categoryRoutes from "../backend/src/routes/categories.js";
import analyticsRoutes from "../backend/src/routes/analytics.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/shifts", shiftRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/analytics", analyticsRoutes);

// Cache the DB connection across warm Lambda invocations
let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
}
