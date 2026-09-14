import { Hono } from "hono";
import type { HonoEnv } from "../middlewares/session-middleware";
import { db } from "../db";
import { inventory, products } from "../db/schema";
import { desc, eq, getColumns, sql } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { productSchema, productSelectSchema } from "../db/validators";

const app = new Hono<HonoEnv>()
  .get("/", async (c) => {
    const results = await db
      .select({
        ...getColumns(products),
        quantity: sql<number>`coalesce(${inventory.quantity}, 0)`.mapWith(
          Number,
        ),
        minStockLevel:
          sql<number>`coalesce(${inventory.minStockLevel}, 0)`.mapWith(Number),
      })
      .from(products)
      .leftJoin(inventory, eq(products.id, inventory.productId))
      .where(eq(products.isDeleted, false))
      .orderBy(desc(products.createdAt));
    return c.json(results);
  })
  .post("/", zValidator("json", productSchema), async (c) => {
    const data = c.req.valid("json");
    await db.insert(products).values(data);
    return c.json({ success: true });
  })
  .put("/", zValidator("json", productSelectSchema), async (c) => {
    const data = c.req.valid("json");
    const result = await db
      .update(products)
      .set(data)
      .where(eq(products.id, data.id))
      .returning({ id: products.id });
    if (result[0]) {
      return c.json({ success: true });
    } else {
      return c.json({ success: false, error: "No rows were inserted" }, 400);
    }
  })
  .delete("/:id", async (c) => {
    const { id } = c.req.param();
    const result = await db
      .update(products)
      .set({ isDeleted: true })
      .where(eq(products.id, id))
      .returning({ id: products.id });
    if (!result[0]) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }
    return c.json({ success: true });
  });

export default app;
