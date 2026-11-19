import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { MIGRATIONS_DIR } from "./constants/index.ts";
import * as schema from "./schema.ts";

/** Opens the SQLite file (or `:memory:`) and applies any pending migrations. */
export function openDb(path: string) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });

  const client = new Database(path, { create: true });
  client.run("PRAGMA journal_mode = WAL;");
  client.run("PRAGMA foreign_keys = ON;");

  const db = drizzle({ client, schema });
  migrate(db, { migrationsFolder: MIGRATIONS_DIR });
  return db;
}

export type Db = ReturnType<typeof openDb>;
