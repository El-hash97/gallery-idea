import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

function instantiate(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL belum diset. Isi .env.local dengan connection string Neon (lihat .env.example).",
    );
  }
  return drizzle(neon(url), { schema });
}

let cached: Db | undefined;

export const db = new Proxy({} as Db, {
  get(_target, prop: string) {
    if (!cached) cached = instantiate();
    const value = (cached as unknown as Record<string, unknown>)[prop];
    return typeof value === "function" ? value.bind(cached) : value;
  },
});

export { schema };
