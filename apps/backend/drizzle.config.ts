import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!Bun.env.DATABASE_URL_UNPOOLED) {
  throw new Error("DATABASE_URL_UNPOOLED is not set in the .env file");
}

export default defineConfig({
  out: "./db/drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: Bun.env.DATABASE_URL_UNPOOLED!,
  },
});
