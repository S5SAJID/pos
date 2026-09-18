import { Hono } from "hono";
import { cors } from "hono/cors";
import categoriesHandler from "./endpoints/categories";
import expensesHandler from "./endpoints/expenses";
import inventoryHandler from "./endpoints/inventory";
import mcpHandler from "./endpoints/mcp";
import productsHandler from "./endpoints/products";
import reportHandler from "./endpoints/report";
import transactionsHandler from "./endpoints/transactions";
import { auth } from "./lib/auth";
import {
  type HonoEnv,
  sessionMiddleware,
} from "./middlewares/session-middleware";

const app = new Hono<HonoEnv>()
  .use(
    "*",
    cors({
      origin: Bun.env.FRONTEND_URL ?? "https://localhost:3000",
      credentials: true,
    }),
  )
  .on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .use("/data/*", sessionMiddleware)
  .route("/data/products", productsHandler)
  .route("/data/inventory", inventoryHandler)
  .route("/data/transactions", transactionsHandler)
  .route("/data/expenses", expensesHandler)
  .route("/data/report", reportHandler)
  .route("/data/categories", categoriesHandler)
  .route("/ai/", mcpHandler);

export default app;
export type AppType = typeof app;
