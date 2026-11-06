"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { searchNotesAction } from "@/server/actions/notebooks";

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<
    { id: string; title: string; notebookId: string }[]
  >([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const id = setTimeout(() => {
      startTransition(async () => {
        const rows = await searchNotesAction(q);
        setResults(rows);
      });
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <div className="relative font-switzer">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search notes…"
        className="w-full rounded-xl border border-bg-border bg-white px-3 py-2 text-[13px] outline-none focus:border-blue"
      />
      {q.trim() ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-64 overflow-auto rounded-xl border border-bg-border bg-white p-1 shadow-lg">
          {pending && results.length === 0 ? (
            <p className="px-3 py-2 text-[12px] text-muted">Searching…</p>
          ) : null}
          {!pending && results.length === 0 ? (
            <p className="px-3 py-2 text-[12px] text-muted">No matches</p>
          ) : null}
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/app/n/${r.id}`}
              onClick={() => setQ("")}
              className="block rounded-lg px-3 py-2 text-[13px] text-ink hover:bg-bg-muted"
            >
              {r.title || "Untitled"}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
