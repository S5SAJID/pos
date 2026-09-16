import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { Hono } from "hono";
import type { HonoEnv } from "../middlewares/session-middleware";
import { formatSchemaForAI } from "../lib/schema-to-md";
import * as schema from "../db/schema";
import { Parser, type From } from "node-sql-parser";
import { getTableNamesFromSchema } from "../lib/table-names";

const app = new Hono<HonoEnv>();

const mcphandler = createMcpHandler(
  (server) => {
    (server.registerTool(
      "init_pos",
      { description: "always run this tool first when using this plugin" },
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
          title: "Run Database Mutation",
          description:
            "Executes raw postgresql SQL SELECT statements. Use this for fetching data, complex filtering, joins, and aggregations based on the provided schema context. One statement at a time. Always include `limit` with query. Always read the db schema resource first by calling `init_pos` tool to understand table structure.",
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
          console.log(input.query);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(sql.raw(input.query).getSQL(), null, 2),
              },
            ],
          };
        },
      ));
  },
  {
    instructions:
      "This is the pos tool of the users store. Use this tool when the user ask about his store products, performance, or any thing related to his store.",
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

    return parser.sqlify(queryObj);
  } catch (err: any) {
    throw new Error(
      "Invalid SQL syntsax. " + err.message || "Invalid SQL syntax.",
    );
  }
}

export default app;
