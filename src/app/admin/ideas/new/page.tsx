"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewIdeaPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const form = new FormData(event.currentTarget);
    const now = new Date();
    const monthDefault = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          category: form.get("category"),
          description: form.get("description"),
          explanation: form.get("explanation"),
          month: String(form.get("month")) || monthDefault,
          lockStatus: "hidden",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Gagal menyimpan");
        return;
      }
      router.push(`/admin/ideas/${data.idea.id}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Tambah Ide</h1>
      <p className="mt-1 text-sm text-gray-600">
        Ide baru tersimpan tersembunyi sampai kamu mengubah statusnya.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="block text-sm font-medium">
          Judul
          <input
            name="title"
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
              required
              placeholder="mis. produk, mesin, web"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Bulan (YYYY-MM)
            <input
              name="month"
              pattern="\d{4}-\d{2}"
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="block text-sm font-medium">
          Deskripsi singkat
          <textarea
            name="description"
            rows={3}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium">
          Penjelasan lengkap
          <textarea
            name="explanation"
            rows={8}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-fit rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}
