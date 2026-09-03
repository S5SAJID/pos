import {
  expenses,
  products,
  transactionStatusEnum,
  categoryEnum,
  inventory,
  paymentMethodEnum,
  transactionItems,
  transactions,
} from "./schema";

export type Expense = typeof expenses.$inferSelect;
export type ExpenseInsert = typeof expenses.$inferInsert;

export type Product = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;

export type Inventory = typeof inventory.$inferSelect;
export type InventoryInsert = typeof inventory.$inferInsert;

export type TransactionItem = typeof transactionItems.$inferSelect;
export type TransactionItemInsert = typeof transactionItems.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type TransactionInsert = typeof transactions.$inferInsert;

export type ExpenseCategory = (typeof categoryEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type TransactionStatus = typeof transactionStatusEnum.enumValues;
