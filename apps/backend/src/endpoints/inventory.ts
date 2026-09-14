import { Hono } from "hono";
import type { HonoEnv } from "../middlewares/session-middleware";
import { db } from "../db";
import { expenses, inventory } from "../db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { inventorySchema } from "../db/validators";
import { transactionsDB } from "../db/transactions-db";

const app = new Hono<HonoEnv>()
  .get("/", async (c) => {
    const results = await db
      .select()
      .from(inventory)
      .orderBy(desc(inventory.createdAt));
    return c.json(results);
  })
  .post("/", zValidator("json", inventorySchema), async (c) => {
    const { productId, quantity, minStockLevel } = c.req.valid("json");

    try {
      await transactionsDB.transaction(async (tx) => {
        // Validate product exists
        const existingProduct = await tx.query.products.findFirst({
          where: { id: productId },
        });
        if (!existingProduct) {
          throw new Error("Product not found");
        }

        // Check if inventory exists
        const existingInventory = await tx.query.inventory.findFirst({
          where: { productId },
        });

        // Calculate expense amount
        const expenseAmount = String(Number(existingProduct.cost) * quantity);

        // Always create expense (you're buying stock)
        await tx.insert(expenses).values({
          amount: expenseAmount,
          category: "SUPPLY",
          description: `Restocked ${quantity} x ${existingProduct.name}`,
        });

        // Update or create inventory
        if (existingInventory) {
          // Update quantity + optionally update minStockLevel
          await tx
            .update(inventory)
            .set({ quantity: sql`quantity + ${quantity}`, minStockLevel })
            .where(eq(inventory.id, existingInventory.id));
        } else {
          await tx.insert(inventory).values({
            productId,
            quantity,
            minStockLevel,
          });
        }
      });

      return c.json({ success: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update inventory";
      return c.json({ success: false, error: message }, 400);
    }
  })
  .put(
    "/:id",
    zValidator(
      "json",
      inventorySchema
        .pick({ quantity: true, minStockLevel: true })
        .partial({ minStockLevel: true }),
    ),
    async (c) => {
      const id = c.req.param("id");
      const { quantity, minStockLevel } = c.req.valid("json");

      try {
        // Just check if inventory exists
        const existingInventory = await db.query.inventory.findFirst({
          where: { id },
          with: { product: true },
        });

        if (!existingInventory || !existingInventory.product) {
          throw new Error("Inventory or product not found");
        }

        await transactionsDB.transaction(async (tx) => {
          if (quantity > existingInventory.quantity) {
            const restockQuantity = quantity - existingInventory.quantity;
            const expenseAmount = String(
              Number(existingInventory.product!.cost) * restockQuantity,
            );
            await tx.insert(expenses).values({
              amount: expenseAmount,
              category: "SUPPLY",
              description: `Stock correction: added ${restockQuantity} x ${existingInventory.product!.name}`,
            });
          }

          await tx
            .update(inventory)
            .set({ quantity, minStockLevel })
            .where(eq(inventory.id, id));
        });

        return c.json({ success: true });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update inventory";
        return c.json({ success: false, error: message }, 400);
      }
    },
  );

export default app;
