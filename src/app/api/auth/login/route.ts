import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUser } from "@/db/schema";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const username = typeof body?.username === "string" ? body.username : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }

    const [admin] = await db.select().from(adminUser).where(eq(adminUser.username, username));
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    await setSessionCookie(createSessionToken(admin.id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login gagal";
    const configMissing = message.includes("SESSION_SECRET") || message.includes("DATABASE_URL");
    return NextResponse.json(
      { error: configMissing ? "Konfigurasi server belum lengkap (env variabel terlewat)" : message },
      { status: configMissing ? 500 : 500 },
    );
  }
}
