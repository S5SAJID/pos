import { Hono } from "hono";
import { db } from "../db";
import { inventory, products, transactionItems, transactions } from "../db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import type { HonoEnv } from "../middlewares/session-middleware";
import { transactionSchema } from "../db/validators";
import Qs from "qs";
import { transactionsCrud } from "../db/crud";

const app = new Hono<HonoEnv>()
  .get("/", async (c) => {
    const searchParams = new URL(c.req.url).searchParams;
    const options = Qs.parse(searchParams.toString(), {
      decoder: (str, defaultDecoder) => {
        if (str === "true") return true;
        if (str === "false") return false;
        if (str !== "" && !isNaN(Number(str))) return Number(str);
        return defaultDecoder(str);
      },
    });

    const results = await transactionsCrud.list({
      ...options,
      page: Number(options.page) || 1,
      limit: Number(options.limit) || 15,
    });

    return c.json({ ...results, pages: Math.ceil(results.total / results.limit) });
  })
  .get(":id", async (c) => {
    const { id } = c.req.param();
    const results = await db
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, id));
    return c.json(results);
  })
  .post("/", zValidator("json", transactionSchema), async (c) => {
    const { items, paymentMethod } = c.req.valid("json");
    const { user } = c.get("session");

    // check if the user submits products with same id as two items
    const uniqueProdIds = new Set(items.map((i) => i.id));
    if (uniqueProdIds.size !== items.length) {
      return c.json({ success: false, error: "Duplicate products in transaction" }, 400);
    }

    try {
      return await db.transaction(async (tx) => {
        const selectedProducts = await tx
          .select()
          .from(products)
          .where(
            and(
              inArray(
                products.id,
                items.map((item) => item.id),
              ),
              eq(products.isDeleted, false),
            ),
          );

        const productsMap = new Map(selectedProducts.map((prod) => [prod.id, prod]));

        for (const item of items) {
          if (!productsMap.has(item.id)) {
            throw new Error(`Product ${item.id} not found`);
          }
        }

        const inventoryRecords = await tx
          .select()
          .from(inventory)
          .where(
            inArray(
              inventory.productId,
              items.map((item) => item.id),
            ),
          );

        const inventoryMap = new Map(inventoryRecords.map((inv) => [inv.productId, inv]));

        for (const item of items) {
          const inv = inventoryMap.get(item.id);
          if (!inv) {
            throw new Error(`No inventory record for product ${item.id}`);
          }
          if (inv.quantity < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.id}`);
          }
        }

        const totalPrice = items.reduce((total, item) => {
          const product = productsMap.get(item.id);
          return total + Number(product?.price) * item.quantity;
        }, 0);

        const totalCost = items.reduce((total, item) => {
          const product = productsMap.get(item.id);
          return total + Number(product?.cost) * item.quantity;
        }, 0);

        const netProfit = totalPrice - totalCost;

        // Create transaction
        const [currentTransaction] = await tx
          .insert(transactions)
          .values({
            paymentMethod,
            userId: user.id,
            grossProfit: netProfit.toString(),
            totalAmount: totalPrice.toString(),
            status: "COMPLETED",
          })
          .returning({ id: transactions.id });

        if (!currentTransaction) throw Error("Failed to create transaction");

        // Insert transaction items
        await Promise.all(
          items.map((item) => {
            const product = productsMap.get(item.id);
            if (!product) throw Error("Product not found when inserting transaction items");
            return tx.insert(transactionItems).values({
              productId: product.id,
              quantity: item.quantity,
              unitPrice: product?.price,
              transactionId: currentTransaction.id,
            });
          }),
        );

        // Update inventory
        await Promise.all(
          items.map((item) => {
            const inv = inventoryMap.get(item.id);
            if (!inv) throw Error("Invertory record not found when inserting transaction items");
            return tx
              .update(inventory)
              .set({ quantity: inv.quantity - item.quantity })
              .where(eq(inventory.productId, item.id));
          }),
        );

        return c.json({
          success: true,
          transactionId: currentTransaction.id,
          totalPrice,
          netProfit,
        });
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        400,
      );
    }
  });

export default app;
