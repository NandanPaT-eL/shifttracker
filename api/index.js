import { connectDB } from "../backend/src/db.js";
import { createApp } from "../backend/src/app.js";

let appPromise;

function getApp() {
  if (!appPromise) {
    appPromise = connectDB().then(() => createApp());
  }
  return appPromise;
}

export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error("[api] handler error:", err);
    if (!res.headersSent) {
      res.status(503).json({ error: err.message || "Service unavailable" });
    }
  }
}
