import { test, expect, describe, beforeEach } from "bun:test";
import { db } from "./db";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";
import { transactionSchema } from "./db/validators";
import { auth } from "./lib/auth";
import { createInsertSchema } from "drizzle-zod";
import type { TransactionInsert } from "./db/types";

describe("Database Integration Tests", () => {
  beforeEach(async () => {
    await db.delete(schema.transactionItems);
    await db.delete(schema.transactions);
    await db.delete(schema.inventory);
    await db.delete(schema.products);
    await db.delete(schema.expenses);
    await db.delete(schema.users);
    await db.delete(schema.account);
    await db.delete(schema.session);
    await db.delete(schema.verification);
  });

  test("creating a product inserts correctly", async () => {
    const productData = {
      name: "Tapal Danedar 950g",
      sku: "TAP-950",
      price: "1450.00",
      cost: "1200.00",
    };
    const [insertedProduct] = await db
      .insert(schema.products)
      .values(productData)
      .returning();
    if (!insertedProduct) throw new Error("Product insertion failed");
    expect(insertedProduct).toBeDefined();
    expect(insertedProduct.id).toBeDefined();

    const [fetchedProduct] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, insertedProduct.id));
    if (!fetchedProduct) throw new Error("Product fetch failed");

    expect(fetchedProduct.name).toBe(productData.name);
    expect(fetchedProduct.sku).toBe(productData.sku);
    expect(fetchedProduct.price).toBe(productData.price);
    expect(fetchedProduct.cost).toBe(productData.cost);
    expect(fetchedProduct.createdAt).toBeInstanceOf(Date);
  });

  test("transaction creation validates Zod schema", async () => {
    const { user } = await auth.api.signUpEmail({
      body: {
        email: "hayakhan.45@gmail.com",
        name: "Haya K.",
        password: "idontknowwhyiusedhayasname",
      },
    });

    const validPayload: TransactionInsert = {
      userId: user.id,
      totalAmount: "2500.00",
      paymentMethod: "EASYPAISA",
      grossProfit: "500.00",
      status: "PENDING",
    };

    const validResult = createInsertSchema(schema.transactions).safeParse(
      validPayload,
    );
    expect(validResult.success).toBe(true);

    if (validResult.success) {
      const [insertedTx] = await db
        .insert(schema.transactions)
        .values([validResult.data])
        .returning();
      if (!insertedTx) throw new Error("Transaction insertion failed");

      expect(insertedTx.id).toBeDefined();
      expect(insertedTx.status).toBe("PENDING");
    }

    const invalidPayload = {
      userId: user.id,
      totalAmount: "2500.00",
      paymentMethod: "CRYPTO",
    };

    const invalidResult = transactionSchema.safeParse(invalidPayload);
    expect(invalidResult.success).toBe(false);
    if (!invalidResult.success) {
      expect(invalidResult?.error?.issues[0]!.path).toContain("paymentMethod");
    }
  });

  test("expenses are stored correctly", async () => {
    const expenseData = {
      amount: "45000.00",
      category: "RENT" as const,
      description: "Monthly shop rent",
    };

    const [insertedExpense] = await db
      .insert(schema.expenses)
      .values(expenseData)
      .returning();
    if (!insertedExpense) throw new Error("Expense insertion failed");

    expect(insertedExpense).toBeDefined();

    const [dbExpense] = await db
      .select()
      .from(schema.expenses)
      .where(eq(schema.expenses.id, insertedExpense.id));

    if (!dbExpense) throw new Error("Expense fetch failed");

    expect(dbExpense.amount).toBe(expenseData.amount);
    expect(dbExpense.category).toBe(expenseData.category);
    expect(dbExpense.description).toBe(expenseData.description);
    expect(dbExpense.createdAt).toBeInstanceOf(Date);
  });
});
