import "dotenv/config";
import { connectDB } from "./src/db.js";
import { createApp } from "./src/app.js";

const PORT = process.env.PORT || 5050;

async function main() {
  await connectDB();

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`[api] listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
