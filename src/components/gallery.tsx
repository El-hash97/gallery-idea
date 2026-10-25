"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

export type GalleryIdea = {
  id: string;
  title: string;
  category: string;
  month: string;
  lockStatus: "open" | "title_only" | "hidden";
  description: string;
  reviewed: boolean;
};

const labelBulan = (ym: string): string => {
  const bulan = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const [y, m] = ym.split("-");
  return `${bulan[Number(m) - 1]} ${y}`;
};

export default function Gallery({ ideas }: { ideas: GalleryIdea[] }) {
  const initialMonths = useMemo(
    () => [...new Set(ideas.map((i) => i.month))].sort().reverse(),
    [ideas],
  );
  const initialCategories = useMemo(
    () => [...new Set(ideas.map((i) => i.category))].sort(),
    [ideas],
  );

  const [month, setMonth] = useState<string>("semua");
  const [category, setCategory] = useState<string>("semua");

  const filtered = useMemo(
    () =>
      ideas.filter(
        (i) =>
          (month === "semua" || i.month === month) &&
          (category === "semua" || i.category === category),
      ),
    [ideas, month, category],
  );

  const listRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const cards = listRef.current?.querySelectorAll("[data-card]");
      if (!cards || cards.length === 0) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(cards, { opacity: 1, y: 0 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.42,
            ease: "power2.out",
            stagger: 0.05,
            overwrite: true,
          },
        );
      });
    }, listRef);
    return () => context.revert();
  }, [filtered]);

  return (
    <section aria-label="Galeri ide">
      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-4 border-y border-rule py-4">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Ide — diindeks per bulan
        </h2>
        <div role="group" aria-label="Filter galeri" className="flex flex-wrap gap-2">
          <FilterSet
            label="Bulan"
            options={initialMonths}
            value={month}
            onChange={setMonth}
          />
          <FilterSet
            label="Kategori"
            options={initialCategories}
            value={category}
            onChange={setCategory}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-muted">
          Tidak ada ide yang cocok dengan filter ini.
        </p>
      ) : (
        <ul
          ref={listRef}
          className="card-track mt-0 grid grid-cols-[repeat(auto-fill,minmax(min(22rem,100%),1fr))] gap-px bg-rule"
        >
          {filtered.map((idea) =>
            idea.lockStatus === "title_only" ? (
              <li
                key={idea.id}
                data-card
                className="min-w-0 bg-paper-locked p-6 opacity-80"
              >
                <p className="font-outlier text-[0.65rem] uppercase tracking-widest text-neutral">
                  {labelBulan(idea.month)} · {idea.category}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-muted">{idea.title}</h3>
                <p className="mt-4 text-sm text-muted">
                  Terkunci — hanya judul yang tampil.
                </p>
              </li>
            ) : (
              <li key={idea.id} data-card className="card-track min-w-0 bg-paper p-6">
                <p className="font-outlier text-[0.65rem] uppercase tracking-widest text-neutral">
                  {labelBulan(idea.month)} · {idea.category}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{idea.title}</h3>
                <p className="measure mt-3 text-sm leading-normal text-muted line-clamp-3">
                  {idea.description || "Baca penjelasan lengkapnya di halaman detail."}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <Link
                    href={`/ideas/${idea.id}`}
                    className="text-sm font-medium underline decoration-[var(--color-rule)] underline-offset-4 hover:decoration-[var(--color-accent)]"
                  >
                    Buka detail
                  </Link>
                  <StatusChip reviewed={idea.reviewed} />
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}

function FilterSet({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const all = ["semua", ...options];
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-neutral">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer border-0 border-b border-[var(--color-rule)] bg-transparent py-1 pr-6 text-sm text-ink focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
      >
        {value !== "semua" &&
          !options.includes(value) && <option value={value} hidden>{value}</option>}
        {all.map((opt) => (
          <option key={opt} value={opt} className="bg-paper text-ink">
            {opt === "semua" ? "Semua" : label === "Bulan" ? labelBulan(opt) : opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusChip({ reviewed }: { reviewed: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted">
      <span
        aria-hidden
        className={
          reviewed
            ? "inline-block h-2 w-2 bg-[var(--color-accent)]"
            : "inline-block h-2 w-2 border border-[var(--color-neutral)]"
        }
      />
      {reviewed ? "Sudah dinilai" : "Menunggu penilaian"}
    </span>
  );
}
