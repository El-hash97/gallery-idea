"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

type UploadedBlob = Awaited<ReturnType<typeof upload>>;

function fileSizeLabel(pathname: string): string {
  return pathname.split("_").pop()?.includes(".") ? "tersimpan" : "tersimpan";
}

export default function SpikeUploadPage() {
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<UploadedBlob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setProgress(null);

    const file = new FormData(event.currentTarget).get("file") as File | null;
    if (!file) return;

    setBusy(true);
    try {
      const blob = await upload(`spike/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        multipart: file.size > 16 * 1024 * 1024,
        onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
      });
      setResult(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Spike Upload</h1>
      <p className="text-sm text-gray-600">
        Unggah file &gt; 10 MB untuk memvalidasi jalur browser → Vercel Blob (multipart).
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 max-w-md">
        <input type="file" name="file" required />
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {busy ? "Mengunggah..." : "Unggah"}
        </button>
      </form>
      {progress !== null && <p className="mt-4">Progress: {progress}%</p>}
      {result && (
        <div className="mt-4 text-green-700">
          Berhasil: {result.pathname} ({fileSizeLabel(result.pathname)})
        </div>
      )}
      {result?.url && (
        <p className="mt-2 text-xs break-all">
          <a className="underline" href={result.url} target="_blank" rel="noreferrer">
            {result.url}
          </a>
        </p>
      )}
      {error && <p className="mt-4 text-red-700">Error: {error}</p>}
    </main>
  );
}

