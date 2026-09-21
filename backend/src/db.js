import mongoose from "mongoose";
import Category from "./models/Category.js";
import Shift from "./models/Shift.js";

const DEFAULT_CATEGORIES = [
  { name: "IGA",       color: "#3B82F6" },
  { name: "7 Eleven",  color: "#10B981" },
  { name: "Volunteer", color: "#F59E0B" },
];

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI. Set it in backend/.env locally or in Vercel project settings for deployment."
    );
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, { dbName: uri.includes("/shift_tracker") ? undefined : "shift_tracker" });
  console.log(`[db] connected to ${mongoose.connection.name}`);

  // Auto-provision: this is what creates the database & collections on Atlas.
  // MongoDB creates a collection lazily on first write, so we force that here
  // instead of asking the user to run any manual setup step.
  await Promise.all([
    Shift.init(), // builds indexes, creates the "shifts" collection
    Category.init(),
  ]);

  const existingCount = await Category.countDocuments();
  if (existingCount === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES);
    console.log("[db] seeded default categories");
  }

  console.log("[db] ready — database and collections are provisioned");
}
