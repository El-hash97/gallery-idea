import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db } from "@/db";
import { ideaFiles } from "@/db/schema";
import { getSessionAdminId } from "@/lib/auth";

type Params = { params: Promise<{ id: string; fileId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, fileId } = await params;
  const [file] = await db
    .select()
    .from(ideaFiles)
    .where(and(eq(ideaFiles.id, fileId), eq(ideaFiles.ideaId, id)));

  if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });

  await db.delete(ideaFiles).where(eq(ideaFiles.id, fileId));
  await del(file.pathname).catch(() => undefined);

  return NextResponse.json({ ok: true });
}
