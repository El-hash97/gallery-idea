import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { ideas } from "@/db/schema";
import { getSessionAdminId, newId } from "@/lib/auth";
import { currentMonth, ideaInputSchema } from "@/lib/validation";

export async function GET() {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(ideas).orderBy(desc(ideas.createdAt));
  return NextResponse.json({ ideas: rows });
}

export async function POST(request: Request) {
  const adminId = await getSessionAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = ideaInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Data tidak valid", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const id = newId("idea");
  const size = parsed.data;
  const [row] = await db
    .insert(ideas)
    .values({
      id,
      title: size.title,
      category: size.category,
      description: size.description,
      explanation: size.explanation,
      month: size.month || currentMonth(),
      lockStatus: size.lockStatus,
    })
    .returning();

  return NextResponse.json({ idea: row }, { status: 201 });
}

export function DELETE() {
  return NextResponse.json(
    { error: "Use DELETE /api/ideas/[id]" },
    { status: 405 },
  );
}
