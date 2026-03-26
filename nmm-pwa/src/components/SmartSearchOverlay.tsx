"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type SearchMode = "all" | "articles" | "photos";
type SearchResultType = "article" | "photo";

interface SearchResult {
  id: number;
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  categoryLabel: string;
  resultType: SearchResultType;
  imageUrl?: string;
}

interface SearchApiResponse {
  query: string;
  mode: SearchMode;
  results: SearchResult[];
  total: number;
}

interface SmartSearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const SEARCH_MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

const MODE_OPTIONS: Array<{ value: SearchMode; label: string }> = [
  { value: "all", label: "Všetko" },
  { value: "articles", label: "Články" },
  { value: "photos", label: "Fotky" },
];

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

export default function SmartSearchOverlay({ open, onClose }: SmartSearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const normalizedQuery = query.trim();
  const firstResult = results[0] ?? null;
  const canSearch = normalizedQuery.length >= SEARCH_MIN_QUERY_LENGTH;
  const hasSearched = canSearch || results.length > 0;

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 40);

    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();
    let timeoutId: number | null = null;

    if (!canSearch) {
      setResults([]);
      setIsLoading(false);
      return () => {
        controller.abort();
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
      };
    }

    timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        const url = `/api/search?q=${encodeURIComponent(normalizedQuery)}&mode=${mode}`;
        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const data = await response.json() as SearchApiResponse;
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [open, normalizedQuery, mode, canSearch]);

  const statusText = useMemo(() => {
    if (!canSearch) {
      return "Zadaj aspoň 2 znaky.";
    }

    if (isLoading) {
      return "Vyhľadávam...";
    }

    if (results.length === 0) {
      return "Nenašli sa výsledky.";
    }

    return `Nájdené výsledky: ${results.length}`;
  }, [canSearch, isLoading, results.length]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10020]">
      <button
        type="button"
        aria-label="Zatvoriť vyhľadávanie"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(1,8,12,0.76)] backdrop-blur-[2px]"
      />

      <section className="absolute inset-x-3 top-[4.5rem] max-h-[calc(100vh-6.5rem)] overflow-hidden rounded-xl border border-[rgba(111,231,255,0.14)] bg-[rgba(4,20,28,0.97)] shadow-[0_18px_48px_rgba(0,0,0,0.45)] sm:inset-x-6 md:mx-auto md:max-w-4xl">
        <div className="border-b border-[rgba(111,231,255,0.08)] px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="font-sans text-[11px] uppercase tracking-[0.28em] text-(--accent)">Inteligentné vyhľadávanie</div>
            <button
              type="button"
              aria-label="Zatvoriť vyhľadávanie"
              onClick={onClose}
              className="rounded-lg border border-[rgba(111,231,255,0.12)] px-3 py-1 font-sans text-[11px] uppercase tracking-[0.2em] text-slate-200/84 transition-colors hover:border-[rgba(111,231,255,0.28)] hover:text-white"
            >
              Zavrieť
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                className={mode === option.value
                  ? "rounded-full border border-[rgba(74,191,207,0.18)] bg-[rgba(74,191,207,0.14)] px-4 py-2 font-sans text-[11px] uppercase tracking-[0.18em] text-(--accent)"
                  : "rounded-full border border-[rgba(111,231,255,0.08)] bg-[rgba(8,36,46,0.42)] px-4 py-2 font-sans text-[11px] uppercase tracking-[0.18em] text-slate-100/74 transition-colors hover:text-white"}
              >
                {option.label}
              </button>
            ))}
          </div>

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                onClose();
                return;
              }

              if (event.key === "Enter" && firstResult) {
                event.preventDefault();
                router.push(firstResult.href);
                onClose();
              }
            }}
            placeholder="Hľadaj články, témy alebo fotky..."
            className="mt-3 w-full rounded-xl border border-[rgba(111,231,255,0.18)] bg-[rgba(5,25,31,0.8)] px-4 py-3 text-base text-white outline-none transition-colors placeholder:text-slate-300/48 focus:border-(--accent)"
          />
          <p className="mt-2 text-sm text-slate-300/72">{statusText}</p>
        </div>

        <div className="max-h-[calc(100vh-18rem)] overflow-y-auto p-4 sm:p-5">
          {hasSearched && results.length > 0 ? (
            <div className="space-y-3">
              {results.map((result) => {
                const excerpt = truncateText(stripHtml(result.excerpt), 170);
                const isPhotoResult = result.resultType === "photo";

                return (
                  <article key={`${result.resultType}-${result.id}`} className="rounded-lg border border-[rgba(111,231,255,0.1)] bg-[rgba(7,34,42,0.62)] p-3 sm:p-4">
                    <Link href={result.href} onClick={onClose} className="group block">
                      <div className="mb-2 flex flex-wrap items-center gap-2 font-sans text-[10px] uppercase tracking-[0.18em] text-slate-300/72">
                        <span className="rounded-full border border-[rgba(111,231,255,0.14)] px-2 py-1 text-slate-100/80">{result.categoryLabel}</span>
                        <span className={isPhotoResult ? "text-emerald-200/82" : "text-(--accent)"}>
                          {isPhotoResult ? "Fotka" : "Článok"}
                        </span>
                        <span>{result.dateLabel}</span>
                      </div>

                      <div className={isPhotoResult && result.imageUrl ? "grid grid-cols-[84px_minmax(0,1fr)] gap-3 sm:grid-cols-[108px_minmax(0,1fr)]" : ""}>
                        {isPhotoResult && result.imageUrl ? (
                          <div className="relative h-20 w-full overflow-hidden rounded-md border border-[rgba(111,231,255,0.12)] sm:h-24">
                            <Image
                              src={result.imageUrl}
                              alt={result.title}
                              fill
                              quality={90}
                              sizes="108px"
                              className="object-cover"
                            />
                          </div>
                        ) : null}

                        <div>
                          <h3 className="font-serif text-xl leading-tight text-white transition-colors group-hover:text-(--accent)">{result.title}</h3>
                          {excerpt ? <p className="mt-2 text-sm leading-relaxed text-slate-200/76">{excerpt}</p> : null}
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
