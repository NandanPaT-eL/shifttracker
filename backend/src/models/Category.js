import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    color: { type: String, default: "#0A84FF" },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
