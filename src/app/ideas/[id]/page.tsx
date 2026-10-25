import { asc, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { ideas, ideaFiles } from "@/db/schema";
import ModelViewer from "@/components/model-viewer";

export const dynamic = "force-dynamic";

export default async function PublicIdeaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
  if (!idea || idea.lockStatus === "hidden") notFound();

  const files =
    idea.lockStatus === "open"
      ? await db
          .select()
          .from(ideaFiles)
          .where(eq(ideaFiles.ideaId, id))
          .orderBy(asc(ideaFiles.sortOrder))
      : [];

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-rule px-6 py-5 sm:px-10">
        <Link href="/" className="font-outlier text-xs font-medium uppercase tracking-[0.25em]">
          Gallery Idea
        </Link>
        <Link href="/#galeri" className="text-sm text-muted hover:text-ink">
          Kembali ke galeri
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24 sm:px-10">
        {idea.lockStatus === "title_only" ? (
          <>
            <p className="font-outlier mt-14 text-[0.65rem] uppercase tracking-widest text-neutral">
              {idea.month} · {idea.category}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {idea.title}
            </h1>
            <p className="mt-8 border border-dashed border-[var(--color-rule)] p-6 text-muted">
              Ide ini terkunci — kontennya hanya untuk penilai.
            </p>
          </>
        ) : (
          <article className="mt-14">
            <p className="font-outlier text-[0.65rem] uppercase tracking-widest text-neutral">
              {idea.month} · {idea.category}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {idea.title}
            </h1>

            {idea.description && (
              <p className="measure mt-6 text-base leading-relaxed">{idea.description}</p>
            )}
            {idea.explanation && (
              <p className="measure mt-4 whitespace-pre-wrap text-base leading-relaxed text-muted">
                {idea.explanation}
              </p>
            )}

            {files.length > 0 && (
              <section className="mt-14 space-y-10">
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
                    {file.kind === "video" && (
                      <video src={file.url} controls className="w-full border border-rule" />
                    )}
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
                      <a
                        href={file.url}
                        download
                        className="underline decoration-rule underline-offset-4 hover:decoration-accent"
                      >
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
          </article>
        )}
      </main>
    </div>
  );
}
