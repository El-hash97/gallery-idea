import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { reviewTokens, reviews } from "@/db/schema";
import { hashReviewToken } from "@/lib/tokens";

const reviewInputSchema = z.object({
  token: z.string().min(20).max(200),
  score: z.number().int().min(1).max(10),
  comment: z.string().max(5000).default(""),
});

export async function POST(request: Request) {
  const parsed = reviewInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid — skor harus 1–10 dan komentar teks." },
      { status: 400 },
    );
  }

  const [{ token, score, comment }] = [parsed.data];
  const tokenHash = hashReviewToken(token);

  const [activeToken] = await db
    .select()
    .from(reviewTokens)
    .where(eq(reviewTokens.tokenHash, tokenHash));

  if (!activeToken || !activeToken.active) {
    return NextResponse.json({ error: "Link penilaian tidak valid." }, { status: 404 });
  }

  const [existing] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.ideaId, activeToken.ideaId));

  const entry = JSON.stringify({
    at: new Date().toISOString(),
    score,
    comment,
  });

  if (existing) {
    const history = JSON.parse(existing.history || "[]") as unknown[];
    await db
      .update(reviews)
      .set({
        score,
        comment,
        history: JSON.stringify([...history, entry]),
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, existing.id));
  } else {
    await db.insert(reviews).values({
      id: `rev_${crypto.randomUUID()}`,
      ideaId: activeToken.ideaId,
      score,
      comment,
      history: JSON.stringify([entry]),
    });
  }

  return NextResponse.json({ ok: true });
}
