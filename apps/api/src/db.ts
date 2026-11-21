import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { migrate } from "drizzle-orm/bun-sql/migrator";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { MIGRATIONS_DIR } from "./constants/index.ts";
import * as schema from "./schema.ts";

/** Any Postgres connection Drizzle can drive: Bun's client here, PGlite in tests. */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

/** Connects to Postgres (`postgres://user:password@host:port/db`) and applies pending migrations. */
export async function openDb(url: string): Promise<Db> {
  const db = drizzle({ client: new SQL(url), schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
  return db;
}
