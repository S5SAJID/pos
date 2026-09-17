import { getTableName, is, Table } from "drizzle-orm";
import * as schema from "../db/schema";

export function getTableNamesFromSchema(): string[] {
  const names = [];
  for (const [_exportName, entity] of Object.entries(schema)) {
    if (!entity || typeof entity !== "object" || !is(entity, Table)) continue;
    const tableName = getTableName(entity);
    names.push(tableName);
  }
  return names;
}
