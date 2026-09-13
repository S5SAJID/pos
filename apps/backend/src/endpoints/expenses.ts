import { Hono } from "hono";
import { db } from "../db";
import { expenses } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { expensesSchema } from "../db/validators";
import type { HonoEnv } from "../middlewares/session-middleware";
import { parse as parseQs } from "qs";
import { expenseCrud } from "../db/crud";

const app = new Hono<HonoEnv>()
  .get("/", async (c) => {
    const searchParams = new URL(c.req.url).searchParams;
    const options = parseQs(searchParams.toString(), {
      decoder: (str, defaultDecoder) => {
        if (str === "true") return true;
        if (str === "false") return false;
        if (str !== "" && !isNaN(Number(str))) return Number(str);
        return defaultDecoder(str);
      },
    });

    
    const orderBy = options.orderBy as any ?? [{ field: "createdAt", direction: "desc" }];
    
    const results = await expenseCrud.list({
      ...options,
      page: Number(options.page) || 1,
      limit: Number(options.limit) || 15,
      orderBy: orderBy,
    });

    return c.json({ ...results, pages: Math.ceil(results.total / results.limit) });
  })
  .post("/", zValidator("json", expensesSchema), async (c) => {
    try {
      const { amount, category, description } = c.req.valid("json");
      const [expense] = await db.insert(expenses).values({ amount, category, description }).returning({ id: expenses.id });
      if (!expense) throw Error("Failed to create expense");
      return c.json({ success: true, id: expense.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create expense";
      return c.json({ success: false, error: message }, 500);
    }
  });

export default app;
