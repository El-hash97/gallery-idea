"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminNav() {
  return (
    <nav className="flex items-center gap-6">
      <Link href="/admin" className="text-sm font-semibold">
        Gallery Idea
      </Link>
      <Link href="/admin" className="text-sm text-gray-700 hover:underline">
        Dashboard
      </Link>
      <Link href="/admin/ideas/new" className="text-sm text-gray-700 hover:underline">
        Tambah Ide
      </Link>
      <Link href="/" className="text-sm text-gray-700 hover:underline">
        Lihat Landing Page
      </Link>
    </nav>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={busy}
      className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
    >
      {busy ? "Keluar..." : "Keluar"}
    </button>
  );
}
