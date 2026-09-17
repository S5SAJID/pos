import { Column, getTableName, is, Table } from "drizzle-orm";

export function formatSchemaForAI(
  schema: Record<string, any>,
  targetTableName?: string,
): string {
  const parts: string[] = ["DB: POSTGRE SQL."];
  const not_allowed_tables = ["account", "session", "users", "verification"];

  for (const [exportName, entity] of Object.entries(schema)) {
    if (!entity || typeof entity !== "object" || !is(entity, Table)) continue;

    try {
      const tableName = getTableName(entity);

      if (targetTableName && tableName !== targetTableName) {
        continue;
      }

      if (not_allowed_tables.some((v) => v === tableName)) {
        continue;
      }
      parts.push(`TABLE: ${tableName} (export: ${exportName})`);

      for (const [_tsKeyName, colDef] of Object.entries(entity)) {
        if (colDef && typeof colDef === "object" && "columnType" in colDef) {
          const c = colDef as Column;

          // 1. Base Naming & Types (Identify if TS key differs from DB column)
          const dbNameStr = c.name;
          const tsType = c.dataType || "unknown";
          const sqlType = c.columnType || "unknown";

          let line = `  - ${dbNameStr}: ${tsType} | sql: ${sqlType}`;

          // 2. Constraints
          const flags: string[] = [];
          if (c.primary) flags.push("PK");
          if (c.notNull) flags.push("NOT NULL");
          if (c.isUnique) flags.push("UNIQUE");
          // if (c.references || c.foreignKey) flags.push('FK'); TODO: implement this

          if (flags.length > 0) {
            line += ` (${flags.join(", ")})`;
          }

          // 3. Enums
          if (Array.isArray(c.enumValues) && c.enumValues.length > 0) {
            line += ` [enum: ${c.enumValues.join("|")}]`;
          }

          // 4. Defaults
          if (c.hasDefault) {
            const isLiteral =
              typeof c.default === "string" ||
              typeof c.default === "number" ||
              typeof c.default === "boolean";
            const defaultVal = isLiteral ? `"${c.default}"` : "SQL_EXPR";
            line += ` default: ${defaultVal}`;
          }

          parts.push(line);
        }
      }

      parts.push(""); // Spacer between tables
    } catch (e) {
      // Ignore non-table exports gracefully
    }
  }

  return parts.join("\n").trim();
}
