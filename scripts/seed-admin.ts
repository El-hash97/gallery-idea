import "dotenv/config";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { adminUser } from "../src/db/schema";

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const url = process.env.DATABASE_URL;

  if (!username || !password || !url) {
    console.error(
      "Wajib: DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD di .env.local (lihat .env.example).",
    );
    process.exit(1);
  }

  const db = drizzle(neon(url));
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await db.select().from(adminUser).where(eq(adminUser.username, username));

  if (existing.length > 0) {
    await db
      .update(adminUser)
      .set({ passwordHash })
      .where(eq(adminUser.id, existing[0].id));
    console.log(`Admin "${username}" diperbarui.`);
  } else {
    await db.insert(adminUser).values({ id: randomUUID(), username, passwordHash });
    console.log(`Admin "${username}" dibuat.`);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
