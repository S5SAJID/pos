import { defineRelations } from "drizzle-orm";
import {
  inventory,
  products,
  transactionItems,
  transactions,
  expenses,
} from "./schema";
import { users } from "./auth.schema";

export const relations = defineRelations(
  { products, inventory, transactions, transactionItems, users, expenses },
  (r) => ({
    products: {
      inventory: r.many.inventory(),
      transactionItems: r.many.transactionItems(),
    },
    inventory: {
      product: r.one.products({
        from: r.inventory.productId,
        to: r.products.id,
      }),
    },
    users: {
      transactions: r.many.transactions(),
    },
    transactions: {
      user: r.one.users({
        from: r.transactions.userId,
        to: r.users.id,
      }),
      transactionItems: r.many.transactionItems(),
    },
    transactionItems: {
      transaction: r.one.transactions({
        from: r.transactionItems.transactionId,
        to: r.transactions.id,
      }),
      product: r.one.products({
        from: r.transactionItems.productId,
        to: r.products.id,
      }),
    },
  }),
);
