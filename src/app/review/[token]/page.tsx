import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { hashReviewToken } from "@/lib/tokens";
import { ideas, ideaFiles, reviewTokens, reviews } from "@/db/schema";
import ModelViewer from "@/components/model-viewer";
import ReviewForm from "./form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export default async function ReviewPage({ params }: Props) {
  const { token } = await params;
  const tokenHash = hashReviewToken(token);

  const [activeToken] = await db
    .select()
    .from(reviewTokens)
    .where(eq(reviewTokens.tokenHash, tokenHash));

  if (!activeToken || !activeToken.active) {
    return (
      <main className="mx-auto max-w-md px-6 py-24">
        <h1 className="text-2xl font-semibold">Link tidak valid</h1>
        <p className="mt-3 text-muted">
          Link penilaian ini sudah tidak berlaku — kemungkinan telah diganti dengan
          link baru. Hubungi pemilik Galeri untuk link terbaru.
        </p>
        <p className="mt-6 text-sm text-muted">
          <Link href="/" className="underline hover:text-ink">
            Ke halaman galeri
          </Link>
        </p>
      </main>
    );
  }

  const [idea] = await db.select().from(ideas).where(eq(ideas.id, activeToken.ideaId));
  if (!idea) notFound();

  const files = await db
    .select()
    .from(ideaFiles)
    .where(eq(ideaFiles.ideaId, idea.id))
    .orderBy(asc(ideaFiles.sortOrder));

  const [review] = await db.select().from(reviews).where(eq(reviews.ideaId, idea.id));

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 sm:px-10">
      <p className="font-outlier mt-14 text-[0.65rem] uppercase tracking-widest text-neutral">
        {idea.month} · {idea.category}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{idea.title}</h1>

      {idea.description && (
        <p className="measure mt-6 text-base leading-relaxed">{idea.description}</p>
      )}
      {idea.explanation && (
        <p className="measure mt-4 whitespace-pre-wrap text-base leading-relaxed text-muted">
          {idea.explanation}
        </p>
      )}

      {files.length > 0 && (
        <section className="mt-12 space-y-10">
          <h2 className="border-b border-rule pb-3 text-lg font-semibold">
            Lampiran ({files.length})
          </h2>
          {files.map((file) => (
            <figure key={file.id} className="card-track min-w-0">
              {file.kind === "image" && (
                <div className="relative h-[420px] w-full overflow-hidden rounded-none">
                  <Image
                    src={file.url}
                    alt={file.fileName}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                  />
                </div>
              )}
              {file.kind === "video" && <video src={file.url} controls className="w-full border border-rule" />}
              {file.kind === "model3d" && <ModelViewer src={file.url} fileName={file.fileName} />}
              {file.kind === "html" && (
                <iframe
                  src={file.url}
                  sandbox="allow-scripts"
                  className="h-[480px] w-full border border-rule"
                  title={file.fileName}
                />
              )}
              {(file.kind === "cad" || file.kind === "other") && (
                <a href={file.url} download className="underline underline-offset-4 hover:text-accent">
                  Unduh {file.fileName}
                </a>
              )}
              <figcaption className="font-outlier mt-2 text-[0.65rem] uppercase tracking-widest text-neutral">
                {file.kind} · {file.fileName}
              </figcaption>
            </figure>
          ))}
        </section>
      )}

      <section className="mt-16 border-t border-rule pt-8">
        <ReviewForm
          token={token}
          ideaTitle={idea.title}
          existing={review ? { score: review.score, comment: review.comment } : null}
        />
      </section>
    </main>
  );
}
