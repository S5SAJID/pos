import { Hono } from "hono";
import { auth } from "./lib/auth";
import { cors } from "hono/cors";
import { type HonoEnv, sessionMiddleware } from "./middlewares/session-middleware";
import productsHandler from "./endpoints/products";
import inventoryHandler from "./endpoints/inventory";
import transactionsHandler from "./endpoints/transactions";
import expensesHandler from "./endpoints/expenses";
import reportHandler from "./endpoints/report";

const app = new Hono<HonoEnv>()
  .use("*", cors({ origin: Bun.env.FRONTEND_URL ?? "https://localhost:3000", credentials: true }))
  .on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .use("/data/*", sessionMiddleware)
  .route("/data/products", productsHandler)
  .route("/data/inventory", inventoryHandler)
  .route("/data/transactions", transactionsHandler)
  .route("/data/expenses", expensesHandler)
  .route("/data/report", reportHandler);

export default app;
export type AppType = typeof app;
