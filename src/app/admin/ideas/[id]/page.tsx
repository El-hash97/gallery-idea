import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { ideas, ideaFiles, reviews } from "@/db/schema";
import IdeaEditor from "./editor";

type HistoryEntry = { at: string; score: number; comment: string };

const labelBulan: Record<string, string> = {
  open: "Terbuka",
  title_only: "Kunci: judul saja",
  hidden: "Kunci: tersembunyi",
};

export default async function IdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
  if (!idea) notFound();

  const files = await db
    .select()
    .from(ideaFiles)
    .where(eq(ideaFiles.ideaId, id))
    .orderBy(asc(ideaFiles.sortOrder));

  const [review] = await db.select().from(reviews).where(eq(reviews.ideaId, id));
  const history = review
    ? (JSON.parse(review.history || "[]") as HistoryEntry[])
    : [];

  return (
    <div className="max-w-3xl">
      <Link href="/admin" className="text-sm text-muted hover:underline">
        ← Dashboard
      </Link>
      <p className="font-outlier mt-4 text-[0.65rem] uppercase tracking-widest text-neutral">
        {idea.month} · {labelBulan[idea.lockStatus] ?? idea.lockStatus}
      </p>
      <IdeaEditor idea={idea} initialFiles={files} />

      <section className="mt-10 rounded-lg border border-[var(--color-rule)] bg-white p-6">
        <h2 className="font-semibold">Jejak penilaian</h2>
        {!review ? (
          <p className="mt-3 text-sm text-muted">
            Belum ada penilaian. Kirim link penilaian lewat tombol di atas.
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm">
              Skor saat ini: <strong className="font-outlier">{review.score}/10</strong>
            </p>
            {review.comment && (
              <p className="mt-3 whitespace-pre-wrap rounded bg-paper-2 p-3 text-sm">
                {review.comment}
              </p>
            )}
            {history.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-muted hover:text-ink">
                  Riwayat versi ({history.length})
                </summary>
                <ol className="mt-3 space-y-2 text-xs text-muted">
                  {history.map((h, i) => (
                    <li key={`${h.at}-${i}`} className="border-b border-rule pb-2">
                      <span className="font-outlier">{h.score}/10</span> ·{" "}
                      {new Date(h.at).toLocaleString("id-ID")} ·{" "}
                      {h.comment.slice(0, 120) || "(tanpa komentar)"}
                    </li>
                  ))}
                </ol>
              </details>
            )}
          </>
        )}
      </section>
    </div>
  );
}
