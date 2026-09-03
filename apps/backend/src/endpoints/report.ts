import { Hono } from "hono";
import type { HonoEnv } from "../middlewares/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { z } from "zod";
import { expenses, inventory, products, transactionItems, transactions } from "../db/schema";
import { and, between, desc, eq, lt, sql } from "drizzle-orm";
import { getDateRange } from "../lib/util";

const app = new Hono<HonoEnv>().get(
  "/",
  zValidator(
    "query",
    z.object({
      period: z.enum(["today", "weekly", "monthly"]).optional().default("today"),
    }),
  ),
  async (c) => {
    try {
      const { period } = c.req.valid("query");
      const timeRange = getDateRange(period);

      const [
        revenueData,
        lowInventoryData,
        topProductsData,
        expensesTotals,
        expensesByCategory,
        paymentBreakdown,
      ] = await Promise.all([
        // 1. Revenue metrics from completed transactions
        db
          .select({
            totalRevenue: sql<string>`COALESCE(SUM(${transactions.totalAmount}), 0)::text`,
            totalProfit: sql<string>`COALESCE(SUM(${transactions.grossProfit}), 0)::text`,
            transactionCount: sql<number>`COUNT(${transactions.id})::int`.mapWith(Number),
            avgTransactionValue: sql<string>`COALESCE(AVG(${transactions.totalAmount}), 0)::text`,
          })
          .from(transactions)
          .where(
            and(
              between(transactions.createdAt, timeRange.start, timeRange.end),
              eq(transactions.status, "COMPLETED"),
            ),
          ),

        // 2. Low stock alerts (products below minimum level)
        db
          .select({
            id: products.id,
            name: products.name,
            sku: products.sku,
            currentStock: inventory.quantity,
            minStockLevel: inventory.minStockLevel,
            deficit: sql<number>`${inventory.minStockLevel} - ${inventory.quantity}`.mapWith(
              Number,
            ),
          })
          .from(inventory)
          .innerJoin(products, eq(inventory.productId, products.id))
          .where(
            and(lt(inventory.quantity, inventory.minStockLevel), eq(products.isDeleted, false)),
          )
          .orderBy(desc(sql`${inventory.minStockLevel} - ${inventory.quantity}`))
          .limit(20),

        // 3. Top selling products in the period
        db
          .select({
            id: products.id,
            name: products.name,
            sku: products.sku,
            unitsSold: sql<number>`COALESCE(SUM(${transactionItems.quantity}), 0)::int`.mapWith(
              Number,
            ),
            revenue: sql<string>`COALESCE(SUM(${transactionItems.quantity} * ${transactionItems.unitPrice}), 0)::text`,
            transactionCount:
              sql<number>`COUNT(DISTINCT ${transactionItems.transactionId})::int`.mapWith(Number),
          })
          .from(transactionItems)
          .innerJoin(products, eq(transactionItems.productId, products.id))
          .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
          .where(
            and(
              between(transactionItems.createdAt, timeRange.start, timeRange.end),
              eq(transactions.status, "COMPLETED"),
              eq(products.isDeleted, false),
            ),
          )
          .groupBy(products.id, products.name, products.sku)
          .orderBy(desc(sql`SUM(${transactionItems.quantity})`))
          .limit(10),

        // 4a. Total expenses and count
        db
          .select({
            totalExpenses: sql<string>`COALESCE(SUM(${expenses.amount}), 0)::text`,
            expenseCount: sql<number>`COUNT(${expenses.id})::int`.mapWith(Number),
          })
          .from(expenses)
          .where(between(expenses.createdAt, timeRange.start, timeRange.end)),

        // 4b. Expenses grouped by category
        db
          .select({
            category: expenses.category,
            amount: sql<string>`SUM(${expenses.amount})::text`,
            count: sql<number>`COUNT(${expenses.id})::int`.mapWith(Number),
          })
          .from(expenses)
          .where(between(expenses.createdAt, timeRange.start, timeRange.end))
          .groupBy(expenses.category),

        // 5. Revenue breakdown by payment method
        db
          .select({
            paymentMethod: transactions.paymentMethod,
            total: sql<string>`COALESCE(SUM(${transactions.totalAmount}), 0)::text`,
            count: sql<number>`COUNT(${transactions.id})::int`.mapWith(Number),
          })
          .from(transactions)
          .where(
            and(
              between(transactions.createdAt, timeRange.start, timeRange.end),
              eq(transactions.status, "COMPLETED"),
            ),
          )
          .groupBy(transactions.paymentMethod),
      ]);

      // Calculate net profit (revenue - expenses)
      const revenue = parseFloat(revenueData[0]?.totalRevenue || "0");
      const totalExpenses = parseFloat(expensesTotals[0]?.totalExpenses || "0");
      const grossProfit = parseFloat(revenueData[0]?.totalProfit || "0");
      const netProfit = grossProfit - totalExpenses;

      return c.json({
        period: {
          label: period,
          start: timeRange.start.toISOString(),
          end: timeRange.end.toISOString(),
        },
        revenue: {
          total: revenueData[0]?.totalRevenue || "0",
          grossProfit: revenueData[0]?.totalProfit || "0",
          netProfit: netProfit.toFixed(2),
          transactionCount: revenueData[0]?.transactionCount || 0,
          avgTransaction: revenueData[0]?.avgTransactionValue || "0",
          byPaymentMethod: paymentBreakdown.map((pm) => ({
            method: pm.paymentMethod,
            total: pm.total,
            count: pm.count,
            percentage: revenue > 0 ? ((parseFloat(pm.total) / revenue) * 100).toFixed(2) : "0",
          })),
        },
        expenses: {
          total: expensesTotals[0]?.totalExpenses || "0",
          count: expensesTotals[0]?.expenseCount || 0,
          byCategory: expensesByCategory,
        },
        inventory: {
          lowStockItems: lowInventoryData,
          alertCount: lowInventoryData.length,
        },
        topProducts: topProductsData,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: "Failed to generate dashboard report",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  },
);

export default app;
