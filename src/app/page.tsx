import Link from "next/link";
import { desc, ne } from "drizzle-orm";
import { db } from "@/db";
import { ideas, reviews } from "@/db/schema";
import Gallery, { type GalleryIdea } from "@/components/gallery";

export const dynamic = "force-dynamic";

/*
 * Hallmark · genre: editorial · macrostructure: Portfolio Grid
 * nav: N9 edge-aligned · footer: Ft2 inline single line
 */

export default async function LandingPage() {
  const visibleIdeas = await db
    .select()
    .from(ideas)
    .where(ne(ideas.lockStatus, "hidden"))
    .orderBy(desc(ideas.createdAt));

  const allReviews = await db.select().from(reviews);
  const reviewedIds = new Set(allReviews.map((r) => r.ideaId));

  const cards: GalleryIdea[] = visibleIdeas.map((idea) => ({
    id: idea.id,
    title: idea.title,
    category: idea.category,
    month: idea.month,
    lockStatus: idea.lockStatus,
    description: idea.description,
    reviewed: reviewedIds.has(idea.id),
  }));

  const totalBulan = new Set(visibleIdeas.map((i) => i.month)).size;

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-rule px-6 py-5 sm:px-10">
        <Link
          href="/"
          className="font-outlier text-xs font-medium uppercase tracking-[0.25em] text-ink"
        >
          Gallery Idea
        </Link>
        <Link href="/login" className="text-sm text-muted hover:text-ink">
          Login
        </Link>
      </header>

      <main className="px-6 pb-24 sm:px-10">
        <section className="mt-16 sm:mt-24">
          <p className="font-outlier text-[0.65rem] uppercase tracking-[0.25em] text-neutral">
            Koleksi ide pribadi · terbuka hanya untuk yang siap dipamerkan
          </p>
          <h1 className="mt-4 max-w-[34ch] text-4xl font-semibold leading-[1.15] tracking-tight sm:text-6xl">
            Ide yang bisa dinilai lagi, apa pun formatnya.
          </h1>
          <p className="measure mt-5 text-base leading-relaxed text-muted">
            Deskripsi, foto, video, prototipe HTML, model 3D, sampai file CAD — satu
            tempat lengkap, satu jejak digital untuk penilaiannya.
          </p>
          <dl className="mt-8 flex gap-10 border-t border-rule pt-4">
            <div>
              <dt className="font-outlier text-[0.65rem] uppercase tracking-widest text-neutral">
                Bulan aktif
              </dt>
              <dd className="font-outlier text-2xl">{totalBulan}</dd>
            </div>
            <div>
              <dt className="font-outlier text-[0.65rem] uppercase tracking-widest text-neutral">
                Ide tampil
              </dt>
              <dd className="font-outlier text-2xl">{cards.length}</dd>
            </div>
          </dl>
        </section>

        {cards.length > 0 ? (
          <Gallery ideas={cards} />
        ) : (
          <section className="mt-16">
            <p className="mt-4 text-muted">
              Belum ada ide yang tampil di sini. Setelah Admin membukanya, ide akan
              muncul di galeri.
            </p>
          </section>
        )}
      </main>

      <footer className="border-t border-rule px-6 py-5 sm:px-10">
        <p className="flex flex-wrap items-baseline justify-between gap-4 text-xs text-muted">
          <span className="font-outlier uppercase tracking-[0.25em]">Gallery Idea</span>
          <span>
            Dibangun sendiri, satu ide per rilis.{" "}
            <Link href="/login" className="underline hover:text-ink">
              Masuk untuk mengelola
            </Link>
          </span>
        </p>
      </footer>
    </div>
  );
}
