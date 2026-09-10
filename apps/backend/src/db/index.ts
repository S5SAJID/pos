import "dotenv/config";
// import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./relations";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" }); // or .env.local

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, relations, logger: process.env.NODE_ENV === "development" });

// export const db = drizzle(Bun.env.DATABASE_URL!, { relations });
