import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { Hono } from "hono";
import type { HonoEnv } from "../middlewares/session-middleware";
import { formatSchemaForAI } from "../lib/schema-to-md";
import * as schema from "../db/schema";
import { Parser } from "node-sql-parser";
import { getTableNamesFromSchema } from "../lib/table-names";
import { db } from "../db";

const app = new Hono<HonoEnv>();
app.use("/*", async (c, next) => {
  const { auth_token } = c.req.query();
  if (!auth_token) {
    return c.text("Authentication token query is required", 401);
  }
  const serverPassword = Bun.env.MCP_PASSWORD;
  if (!serverPassword) {
    return c.text("MCP server is not configured yet", 501);
  }
  if (serverPassword !== auth_token) {
    return c.text("authentication token is invalid", 401);
  }

  await next();
});

const mcphandler = createMcpHandler(
  (server) => {
    (server.registerTool(
      "init_pos",
      {
        description:
          "CRITICAL: You MUST execute this tool first before calling any other tool in this plugin. It fetches the database schema required to construct valid queries.",
      },
      async () => {
        return {
          content: [
            {
              text: formatSchemaForAI(schema),
              type: "text",
            },
          ],
        };
      },
    ),
      server.registerTool(
        "query_db",
        {
          title: "Run Database Query",
          description:
            "The complete PostgreSQL SELECT statement. Use this for fetching data, complex filtering, joins, and aggregations based on the provided schema context. You MUST explicitly include a 'LIMIT' clause (maximum 100 rows). Example: 'SELECT * FROM products WHERE price > 10 LIMIT 50'",
          inputSchema: {
            query: z
              .string()
              .min(1, "sql query required")
              .refine((v) => validateAndCleanSelectQuery(v))
              .describe(
                "The complete SQL SELECT query to execute (e.g., 'SELECT * FROM products WHERE id = 1 LIMIT 50')",
              ),
          },
        },
        async (input) => {
          try {
            const results = await db.execute(sql.raw(input.query));
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(results.rows, null, 2),
                },
              ],
            };
          } catch (error) {
            return {
              content: [
                {
                  type: "text",
                  text: "An error occured" + (error as Error).message,
                },
              ],
            };
          }
        },
      ));
  },
  {
    instructions: `This is the POS tool for the user's store. Use it when the user asks about store products, performance, or inventory.
CRITICAL SQL RULES:
0. STRICT RULE: You are forbidden from running 'query_db' until you have successfully called 'init_pos' in the current session.
1. Use the exact table structures provided in the schema context. Do not guess column names.`,
    serverInfo: {
      name: "S5POS MCP Server",
      version: "0.1.0",
    },
  },
);

app.all("/*", (c) => mcphandler(c.req.raw));

function validateAndCleanSelectQuery(rawSql: string): string | undefined {
  const parser = new Parser();
  // clean the basics
  const cleanedSql = rawSql.trim().replace(/;\s*$/, "");
  const NOT_ALLOWED_TABLES = ["account", "session", "users", "verification"];

  try {
    const ast = parser.astify(cleanedSql);
    const queryObj = Array.isArray(ast) ? ast[0] : ast;

    if (!queryObj) return;

    if (Array.isArray(ast) && ast.length > 1) {
      throw new Error(
        "Security Exception: Multiple statements are not allowed.",
      );
    }

    if (queryObj.type !== "select") {
      throw new Error(
        "Security Exception: Only read-only SELECT statements are allowed.",
      );
    }

    if (
      (queryObj as any).into &&
      ((queryObj as any).into.position ||
        Object.keys((queryObj as any).into).length > 1 ||
        (queryObj as any).into.target)
    ) {
      throw new Error(
        "Security Exception: Table creation or copying via INTO is prohibited.",
      );
    }

    if (!queryObj.limit) {
      throw new Error(
        "Safety Exception: Limit should be included in query to avoid large result sets.",
      );
    }

    const tables = queryObj.from as any[];

    for (const table of tables) {
      if (NOT_ALLOWED_TABLES.some((val) => val === table.table)) {
        throw new Error(
          "Safety Exception: Authentication tables are not allowed to be read.",
        );
      }
    }

    const allowedTableNames = getTableNamesFromSchema();
    for (const table of tables) {
      if (!allowedTableNames.includes(table.table)) {
        throw new Error(
          "Safety Exception: Only tables returned by the init_pos tool are available.",
        );
      }
    }

    for (const col of queryObj.columns) {
      if (col.expr.type === "function") {
        throw new Error(
          "Safety Exception: Data modification, structural changes, or dangerous PostgreSQL functions are prohibited",
        );
      }
    }

    function scanASTNode(node: any) {
      if (!node || typeof node !== "object") return;

      // Handle arrays (like the 'from' array or 'columns' array)
      if (Array.isArray(node)) {
        for (const item of node) {
          scanASTNode(item);
        }
        return;
      }

      // Check Table Names (Catches top-level tables, subquery tables, and join tables)
      if (node.table && typeof node.table === "string") {
        const tableName = node.table.toLowerCase();

        if (NOT_ALLOWED_TABLES.includes(tableName)) {
          throw new Error(
            `Safety Exception: Authentication table "${node.table}" is not allowed to be read.`,
          );
        }

        if (!allowedTableNames.includes(tableName)) {
          throw new Error(
            `Safety Exception: Table "${node.table}" is not available in the schema.`,
          );
        }
      }

      // Check Functions (Catches mutators or timing anomalies like pg_sleep everywhere)
      if (node.type === "function" || node.type === "aggr_func") {
        // Option: allow specific basic math/aggregate functions if explicitly needed, e.g. COUNT
        const safeWhitelistedFuncs = ["count", "sum", "avg", "min", "max"];
        const funcName = (node.name || "").toLowerCase();

        if (!safeWhitelistedFuncs.includes(funcName)) {
          throw new Error(
            "Safety Exception: Structural changes or dangerous PostgreSQL functions are prohibited.",
          );
        }
      }

      // Recursively dive into all properties of this object (e.g., node.where, node.left, node.ast)
      for (const key in node) {
        if (Object.prototype.hasOwnProperty.call(node, key)) {
          scanASTNode(node[key]);
        }
      }
    }

    // Run the deep scan across the entire structure
    scanASTNode(queryObj);

    return parser.sqlify(queryObj);
  } catch (err: any) {
    throw new Error(
      "Invalid SQL syntax. " + err.message || "Invalid SQL syntax.",
    );
  }
}

export default app;
