import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { ideas, ideaFiles } from "@/db/schema";
import { getSessionAdminId } from "@/lib/auth";
import { ideaFilesInputSchema, ideaUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
  if (!idea) return NextResponse.json({ error: "Ide tidak ditemukan" }, { status: 404 });

  const files = idea
    ? await db.select().from(ideaFiles).where(eq(ideaFiles.ideaId, id)).orderBy(asc(ideaFiles.sortOrder))
    : [];
  return NextResponse.json({ idea, files });
}

export async function PATCH(request: Request, { params }: Params) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = ideaUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const [row] = await db
    .update(ideas)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(ideas.id, id))
    .returning();

  if (!row) return NextResponse.json({ error: "Ide tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ idea: row });
}

export async function DELETE(_request: Request, { params }: Params) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const files = await db.select().from(ideaFiles).where(eq(ideaFiles.ideaId, id));
  await db.delete(ideas).where(eq(ideas.id, id));

  const { del } = await import("@vercel/blob");
  await del(files.map((f) => f.pathname)).catch(() => undefined);

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, { params }: Params) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = ideaFilesInputSchema.safeParse(body?.files);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data file tidak valid" }, { status: 400 });
  }

  const [idea] = await db.select().from(ideas).where(and(eq(ideas.id, id)));
  if (!idea) return NextResponse.json({ error: "Ide tidak ditemukan" }, { status: 404 });

  const existing = await db.select().from(ideaFiles).where(eq(ideaFiles.ideaId, id));
  const startOrder = existing.length;

  const inserted = await db
    .insert(ideaFiles)
    .values(
      parsed.data.map((f, i) => ({
        id: `file_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`,
        ideaId: id,
        kind: f.kind,
        fileName: f.fileName,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
        url: f.url,
        pathname: f.pathname,
        sortOrder: startOrder + i,
      })),
    )
    .returning();

  return NextResponse.json({ files: inserted }, { status: 201 });
}
