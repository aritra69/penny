/** Used when the PORT env var isn't set. */
export const DEFAULT_PORT = 4000;

/** Used when DATABASE_URL isn't set: the Postgres that `docker-compose.yml` starts. */
export const DEFAULT_DATABASE_URL = "postgres://penny:penny@localhost:5432/penny";

export const DEFAULT_PAGE_LIMIT = 50;
export const MIN_PAGE_LIMIT = 1;
export const MAX_PAGE_LIMIT = 200;
export const DEFAULT_PAGE_OFFSET = 0;
