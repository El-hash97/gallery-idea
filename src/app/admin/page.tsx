import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { ideas, reviews } from "@/db/schema";

const LOCK_LABEL: Record<string, string> = {
  open: "Terbuka",
  title_only: "Kunci: judul saja",
  hidden: "Kunci: tersembunyi",
};

export default async function AdminDashboard() {
  const allIdeas = await db.select().from(ideas).orderBy(desc(ideas.createdAt));
  const allReviews = await db.select().from(reviews);

  const reviewByIdea = new Map<string, (typeof allReviews)[number]>();
  for (const r of allReviews) reviewByIdea.set(r.ideaId, r);

  const openCount = allIdeas.filter((i) => i.lockStatus === "open").length;
  const lockedCount = allIdeas.length - openCount;
  const reviewedCount = allIdeas.filter((i) => reviewByIdea.has(i.id)).length;

  const byMonth = new Map<string, number>();
  for (const idea of allIdeas) {
    byMonth.set(idea.month, (byMonth.get(idea.month) ?? 0) + 1);
  }
  const monthBars = [...byMonth.entries()].sort().slice(-12);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/admin/ideas/new"
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Tambah Ide
        </Link>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Total ide", allIdeas.length],
          ["Terbuka", openCount],
          ["Terkunci", lockedCount],
          ["Sudah dinilai", `${reviewedCount}/${allIdeas.length}`],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-lg border border-gray-200 bg-white p-4">
            <dt className="text-xs text-[var(--color-neutral)]">{label}</dt>
            <dd className="mt-1 text-2xl font-bold">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold">Jumlah ide per bulan</h2>
        {monthBars.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-neutral)]">Belum ada ide.</p>
        ) : (
          <div className="mt-4 flex items-end gap-3" style={{ height: 160 }}>
            {monthBars.map(([month, count]) => (
              <div key={month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs text-[var(--color-neutral)]">{count}</span>
                <div
                  className="w-full rounded-t bg-[var(--color-ink)]"
                  style={{ height: `${Math.max(8, (count / Math.max(...monthBars.map(([, c]) => c))) * 120)}px` }}
                />
                <span className="text-xs text-[var(--color-muted)]">{month.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">Semua ide</h2>
        {allIdeas.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-neutral)]">
            Belum ada ide. Mulai dengan &quot;Tambah Ide&quot;.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {allIdeas.map((idea) => {
              const review = reviewByIdea.get(idea.id);
              return (
                <li key={idea.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <div>
                    <Link
                      href={`/admin/ideas/${idea.id}`}
                      className="font-medium hover:underline"
                    >
                      {idea.title}
                    </Link>
                    <p className="text-xs text-[var(--color-muted)]">
                      {idea.month} · {LOCK_LABEL[idea.lockStatus] ?? idea.lockStatus}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <span
                      aria-hidden
                      className={
                        review
                          ? "inline-block h-2 w-2 bg-[var(--color-accent)]"
                          : "inline-block h-2 w-2 border border-[var(--color-neutral)]"
                      }
                    />
                    {review ? `Sudah dinilai · skor ${review.score}/10` : "Menunggu penilaian"}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

