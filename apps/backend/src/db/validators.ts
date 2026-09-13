import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
  expenses,
  inventory,
  paymentMethodEnum,
  products,
} from "./schema";

const priceSchema = z
  .string()
  .regex(/^\d+(\.\d{2})?$/, "Invalid amount format");

export const productSchema = createInsertSchema(products, {
  price: priceSchema,
  cost: priceSchema,
});

export const productSelectSchema = createSelectSchema(products, {
  price: priceSchema,
  cost: priceSchema,
});

export const inventorySchema = createInsertSchema(inventory, {
  quantity: z.number().int().nonnegative(),
  minStockLevel: z.number().int().nonnegative(),
});

export const expensesSchema = createInsertSchema(expenses, {
  amount: priceSchema,
});

export const transactionStatusEnum = z.enum([
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

// export const transactionSchema = createInsertSchema(transactions, {
//   status: transactionStatusEnum,
//   totalAmount: priceSchema,
// });

export const transactionSchema = z.object({
  paymentMethod: z.enum(paymentMethodEnum.enumValues),
  items: z
    .object({
      id: z.uuid(),
      quantity: z.int().positive(),
    })
    .array()
    .min(1)
    .refine((items) => new Set(items.map((e) => e.id)).size === items.length, {
      error: "Duplicate product IDs in items",
    }),
});
