import { join } from "node:path";

/** Drizzle migrations, applied on server start (apps/api/drizzle). */
export const MIGRATIONS_DIR = join(import.meta.dir, "..", "..", "drizzle");
