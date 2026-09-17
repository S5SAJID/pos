import "dotenv/config";
import { relations } from "./relations";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.READONLY_DATABASE_URL!);
export const readOnlyDB = drizzle({
  client: sql,
  relations,
  logger: process.env.NODE_ENV === "development",
});
