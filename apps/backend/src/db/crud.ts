import { drizzleCrud } from "drizzle-crud";
import { zod } from "drizzle-crud/zod";
import { db } from ".";
import { expenses, transactions } from "./schema";

const createCrud = drizzleCrud(db, {
  validation: zod(),
});

export const expenseCrud = createCrud(expenses, {
  searchFields: ["description"],
  defaultLimit: 15,
  allowedFilters: ["category"],
});

export const transactionsCrud = createCrud(transactions, {
  defaultLimit: 15,
  allowedFilters: ["status", "paymentMethod"],
});
