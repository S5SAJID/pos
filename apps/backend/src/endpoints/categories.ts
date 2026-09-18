import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { categories } from "../db/schema";
import { categorySchema, categorySelectSchema } from "../db/validators";
import type { HonoEnv } from "../middlewares/session-middleware";

const app = new Hono<HonoEnv>()
  .get("/", async (c) => {
    const results = await db
      .select()
      .from(categories)
      .orderBy(desc(categories.createdAt));
    return c.json(results);
  })
  .post("/", zValidator("json", categorySchema), async (c) => {
    const data = c.req.valid("json");
    try {
      const result = await db
        .insert(categories)
        .values(data)
        .returning({ id: categories.id });
      return c.json(
        {
          success: true,
          data: result,
        },
        200,
      );
    } catch (error) {
      return c.json(
        {
          success: false,
          error: (error as Error).message,
        },
        500,
      );
    }
  })
  .put("/", zValidator("json", categorySelectSchema), async (c) => {
    const data = c.req.valid("json");
    try {
      const result = await db
        .update(categories)
        .set(data)
        .where(eq(categories.id, data.id))
        .returning();
      return c.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: (error as Error).message,
        },
        500,
      );
    }
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    try {
      await db.delete(categories).where(eq(categories.id, id));
      return c.json({
        success: true,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: (error as Error).message,
        },
        500,
      );
    }
  });

export default app;
