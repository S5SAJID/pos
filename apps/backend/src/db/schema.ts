import { timestamp } from "drizzle-orm/cockroach-core";
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  snakeCase,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth.schema";

export const products = snakeCase.table("products", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  sku: varchar({ length: 255 }),
  price: numeric({ precision: 10, scale: 2 }).notNull(),
  cost: numeric({ precision: 10, scale: 2 }).notNull(),
  isDeleted: boolean().default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const inventory = snakeCase.table("inventory", {
  id: uuid().primaryKey().defaultRandom(),
  productId: uuid()
    .references(() => products.id)
    .notNull(),
  quantity: integer().notNull(),
  minStockLevel: integer()
    .$default(() => 0)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const categoryEnum = pgEnum("category", [
  "RENT",
  "SUPPLY",
  "UTILITIES",
  "SALARIES",
  "MARKETING",
  "SOFTWARE",
  "TRAVEL",
  "INSURANCE",
  "TAXES",
  "OTHER",
]);

export const expenses = snakeCase.table("expenses", {
  id: uuid().primaryKey().defaultRandom(),
  amount: numeric({ precision: 10, scale: 2 }).notNull(),
  category: categoryEnum("category").notNull(),
  description: varchar({ length: 500 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions
export const paymentMethodEnum = pgEnum("payment_method", ["CASH", "CARD", "EASYPAISA"]);
export const transactionStatusEnum = pgEnum("transaction_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

export const transactions = snakeCase.table("transactions", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text()
    .references(() => users.id)
    .notNull(),
  totalAmount: numeric({ precision: 10, scale: 2 }).notNull(),
  grossProfit: numeric({ precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  status: transactionStatusEnum("status").default("COMPLETED").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const transactionItems = snakeCase.table("transaction_items", {
  id: uuid().primaryKey().defaultRandom(),
  transactionId: uuid()
    .references(() => transactions.id, { onDelete: "cascade" })
    .notNull(),
  productId: uuid()
    .references(() => products.id)
    .notNull(),
  quantity: integer().notNull(),
  unitPrice: numeric({ precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export * from "./auth.schema";
