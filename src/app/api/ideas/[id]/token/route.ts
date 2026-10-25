import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reviewTokens } from "@/db/schema";
import { getSessionAdminId, newId } from "@/lib/auth";
import { generateReviewToken, hashReviewToken } from "@/lib/tokens";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tokens = await db.select().from(reviewTokens).where(eq(reviewTokens.ideaId, id));
  const active = tokens.find((t) => t.active);
  return NextResponse.json({ tokenId: active ? active.id : null });
}

export async function POST(_request: Request, { params }: Params) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await db.select().from(reviewTokens).where(eq(reviewTokens.ideaId, id));
  for (const t of existing.filter((x) => x.active)) {
    await db
      .update(reviewTokens)
      .set({ active: false, regeneratedAt: new Date() })
      .where(eq(reviewTokens.id, t.id));
  }

  const raw = generateReviewToken();
  await db.insert(reviewTokens).values({
    id: newId("tok"),
    ideaId: id,
    tokenHash: hashReviewToken(raw),
    active: true,
  });

  return NextResponse.json({ token: raw }, { status: 201 });
}
