import { relations } from "./relations";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 10,
});
attachDatabasePool(pool);

export const transactionsDB = drizzle({
  client: pool,
  relations,
  logger: process.env.NODE_ENV === "development",
});
