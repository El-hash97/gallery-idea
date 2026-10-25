"use client";

import { useState } from "react";

export default function ReviewForm({
  token,
  ideaTitle,
  existing,
}: {
  token: string;
  ideaTitle: string;
  existing: { score: number; comment: string } | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setBusy(true);

    const form = new FormData(event.currentTarget);
    const token = form.get("token") as string | null;
    const comment = String(form.get("comment") ?? "");

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token,
          score: Number(form.get("score")),
          comment,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Penilaian gagal dikirim.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Penilaian gagal dikirim — periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold">
        {existing ? "Perbarui penilaian Anda" : "Nilai ide ini"}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {existing
          ? `Anda sudah menilai "${ideaTitle}". Nilai baru menggantikan yang lama; versi lama tetap tersimpan.`
          : `Skor 1–10 dan saran untuk "${ideaTitle}".`}
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <input type="hidden" name="token" value={token} />
        <label className="block text-sm font-medium">
          Skor
          <select
            required
            name="score"
            defaultValue={existing ? String(existing.score) : ""}
            className="mt-1 cursor-pointer rounded border border-[var(--color-rule)] bg-paper px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Pilih 1–10
            </option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Komentar / saran
          <textarea
            name="comment"
            rows={5}
            maxLength={5000}
            defaultValue={existing?.comment ?? ""}
            className="mt-1 w-full rounded border border-[var(--color-rule)] bg-paper px-3 py-2 text-sm"
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        {success && (
          <p className="rounded border border-[var(--color-rule)] bg-paper-2 p-3 text-sm">
            Penilaian tersimpan. Terima kasih — penilaian tidak terlihat publik.
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-fit cursor-pointer rounded bg-[var(--color-ink)] px-4 py-2 text-sm font-medium text-paper disabled:opacity-50"
        >
          {busy ? "Mengirim..." : existing ? "Perbarui penilaian" : "Kirim penilaian"}
        </button>
      </form>
    </div>
  );
}
