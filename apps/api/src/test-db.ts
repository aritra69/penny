import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { MIGRATIONS_DIR } from "./constants/index.ts";
import type { Db } from "./db.ts";
import * as schema from "./schema.ts";

/** A real Postgres running in memory, with the migrations applied. Tests only: no Docker needed. */
export async function openTestDb(): Promise<Db> {
  const db = drizzle({ client: new PGlite(), schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
  return db;
}
