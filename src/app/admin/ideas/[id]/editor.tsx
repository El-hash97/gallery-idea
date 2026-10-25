"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { upload } from "@vercel/blob/client";
import Link from "next/link";
import type { Idea, IdeaFile } from "@/db/schema";

const KIND_OPTIONS = [
  ["image", "Foto"],
  ["video", "Video"],
  ["html", "HTML"],
  ["model3d", "3D (GLB)"],
  ["cad", "CAD"],
  ["other", "File lain"],
] as const;

function detectKind(file: File): IdeaFile["kind"] {
  const name = file.name.toLowerCase();
  const type = file.type;
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type === "text/html" || name.endsWith(".html")) return "html";
  if (type === "model/gltf-binary" || name.endsWith(".glb") || name.endsWith(".gltf")) return "model3d";
  if ([".dwg", ".dxf", ".step", ".stp", ".igs", ".iges", ".stl"].some((e) => name.endsWith(e)))
    return "cad";
  return "other";
}

export default function IdeaEditor({
  idea,
  initialFiles,
}: {
  idea: Idea;
  initialFiles: IdeaFile[];
}) {
  const router = useRouter();
  const [files, setFiles] = useState<IdeaFile[]>(initialFiles);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadKind, setUploadKind] = useState<IdeaFile["kind"]>("image");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [reviewLink, setReviewLink] = useState<string | null>(null);
  const [tokenBusy, setTokenBusy] = useState(false);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setBusy("save");
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          category: form.get("category"),
          description: form.get("description"),
          explanation: form.get("explanation"),
          month: form.get("month"),
          lockStatus: form.get("lockStatus"),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Gagal menyimpan");
        return;
      }
      setMessage("Tersimpan.");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!confirm("Hapus ide ini beserta semua filenya?")) return;
    setError(null);
    setBusy("delete");
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Gagal menghapus");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function handleUploads(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    setBusy("upload");

    const uploaded: IdeaFile[] = [];
    try {
      for (const file of Array.from(fileList)) {
        if (file.size > 100 * 1024 * 1024) {
          setError(`File ${file.name} melebihi 100 MB`);
          continue;
        }
        setUploadProgress(0);
        const blob = await upload(`ideas/${idea.id}/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
          multipart: file.size > 16 * 1024 * 1024,
          onUploadProgress: (p) => setUploadProgress(Math.round(p.percentage)),
        });
        uploaded.push({
          id: `pending_${uploaded.length}`,
          ideaId: idea.id,
          kind: uploadKind === "other" ? detectKind(file) : uploadKind,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          url: blob.url,
          pathname: blob.pathname,
          sortOrder: files.length + uploaded.length,
          createdAt: new Date(),
        });
      }

      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          files: uploaded.map((f) => ({
            kind: f.kind,
            fileName: f.fileName,
            mimeType: f.mimeType,
            sizeBytes: f.sizeBytes,
            url: f.url,
            pathname: f.pathname,
          })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Gagal menyimpan metadata file");
        return;
      }
      setFiles((prev) => [...prev, ...(data.files as IdeaFile[])]);
      setUploadProgress(null);
    } finally {
      setBusy(null);
      setUploadProgress(null);
    }
  }

  async function handleDeleteFile(file: IdeaFile) {
    setError(null);
    setBusy(`file-${file.id}`);
    try {
      const res = await fetch(`/api/ideas/${idea.id}/files/${file.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Gagal menghapus file");
        return;
      }
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } finally {
      setBusy(null);
    }
  }

  async function handleGenerateToken() {
    setTokenBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/ideas/${idea.id}/token`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.token) {
        setError("Gagal membuat link penilaian");
        return;
      }
      const url = `${window.location.origin}/review/${data.token}`;
      setReviewLink(url);
      void navigator.clipboard?.writeText(url).catch(() => undefined);
      setMessage("Link baru dibuat dan salin otomatis ke clipboard.");
    } finally {
      setTokenBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <label className="block text-sm font-medium">
          Judul
          <input
            name="title"
            defaultValue={idea.title}
            required
            maxLength={200}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Kategori
            <input
              name="category"
              defaultValue={idea.category}
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Bulan (YYYY-MM)
            <input
              name="month"
              pattern="\d{4}-\d{2}"
              defaultValue={idea.month}
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="block text-sm font-medium">
          Status kunci
          <select
            name="lockStatus"
            defaultValue={idea.lockStatus}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="open">Terbuka (tampil publik penuh)</option>
            <option value="title_only">Kunci — hanya judul tampil</option>
            <option value="hidden">Kunci — tersembunyi total</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Deskripsi singkat
          <textarea
            name="description"
            rows={3}
            defaultValue={idea.description}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium">
          Penjelasan lengkap
          <textarea
            name="explanation"
            rows={10}
            defaultValue={idea.explanation}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy !== null}
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy === "save" ? "Menyimpan..." : "Simpan perubahan"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy !== null}
            className="rounded border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {busy === "delete" ? "Menghapus..." : "Hapus ide"}
          </button>
        </div>
      </form>

      {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold">Link penilaian untuk atasan</h2>
        <p className="mt-1 text-sm text-gray-600">
          Atasan tidak perlu login — cukup buka link ini. Link lama otomatis tidak berlaku saat
          membuat yang baru.
        </p>
        <button
          type="button"
          onClick={handleGenerateToken}
          disabled={tokenBusy || busy !== null}
          className="mt-3 rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {tokenBusy ? "Membuat..." : "Buat / Regenerasi Link"}
        </button>
        {reviewLink && (
          <p className="mt-3 break-all rounded bg-gray-100 p-3 text-sm">{reviewLink}</p>
        )}
      </section>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold">File ({files.length})</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium">
            Jenis:
            <select
              value={uploadKind}
              onChange={(e) => setUploadKind(e.target.value as IdeaFile["kind"])}
              className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
            >
              {KIND_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => handleUploads(e.target.files)}
            disabled={busy !== null}
          />
        </div>
        {uploadProgress !== null && <p className="mt-2 text-sm">Mengunggah: {uploadProgress}%</p>}
        <ul className="mt-4 divide-y divide-gray-200">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{f.fileName}</p>
                <p className="text-xs text-gray-500">
                  {f.kind} · {(f.sizeBytes / 1048576).toFixed(1)} MB
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-700 hover:underline"
                >
                  Buka
                </a>
                <button
                  type="button"
                  onClick={() => handleDeleteFile(f)}
                  disabled={busy !== null}
                  className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs text-gray-500">
        Butuh pengeditan file tunggal? <Link href="/admin">Kembali ke dashboard</Link>.
      </p>
    </div>
  );
}
