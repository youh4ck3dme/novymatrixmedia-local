"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import type { SiteComment, SiteCommentsPageData } from "@/types/wordpress";

interface ArticleCommentsProps {
  postId: number;
}

interface CommentFormState {
  authorName: string;
  authorEmail: string;
  authorUrl: string;
  content: string;
  company: string;
}

const COMMENTS_PER_PAGE = 8;

function getInitialFormState(): CommentFormState {
  return {
    authorName: "",
    authorEmail: "",
    authorUrl: "",
    content: "",
    company: "",
  };
}

export default function ArticleComments({ postId }: ArticleCommentsProps) {
  const [comments, setComments] = useState<SiteComment[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formState, setFormState] = useState<CommentFormState>(getInitialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formStartedAt] = useState(() => Date.now());

  const hasMore = useMemo(() => totalPages > 0 && page < totalPages, [page, totalPages]);

  const fetchComments = useCallback(async (requestedPage: number, append: boolean) => {
    const response = await fetch(`/api/comments?postId=${postId}&page=${requestedPage}&perPage=${COMMENTS_PER_PAGE}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Nepodarilo sa načítať komentáre.");
    }

    const data = await response.json() as SiteCommentsPageData;

    setComments((prev) => append ? [...prev, ...data.comments] : data.comments);
    setPage(data.page);
    setTotal(data.total);
    setTotalPages(data.totalPages);
  }, [postId]);

  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        await fetchComments(1, false);
      } catch {
        if (!cancelled) {
          setLoadError("Komentáre sa nepodarilo načítať.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInitial();

    return () => {
      cancelled = true;
    };
  }, [fetchComments]);

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setLoadError(null);

    try {
      await fetchComments(page + 1, true);
    } catch {
      setLoadError("Ďalšie komentáre sa nepodarilo načítať.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          postId,
          authorName: formState.authorName,
          authorEmail: formState.authorEmail,
          authorUrl: formState.authorUrl,
          content: formState.content,
          company: formState.company,
          formStartedAt,
        }),
      });

      const result = await response.json() as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(result.error || "Komentár sa nepodarilo odoslať.");
      }

      setSubmitMessage(result.message || "Komentár bol odoslaný na schválenie.");
      setFormState((prev) => ({
        ...prev,
        content: "",
        company: "",
      }));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Komentár sa nepodarilo odoslať.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto mt-12 max-w-3xl rounded-lg border border-[rgba(111,231,255,0.16)] bg-[rgba(7,34,42,0.56)] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(111,231,255,0.12)] pb-3">
        <div className="font-sans text-[11px] uppercase tracking-[0.28em] text-(--accent)">
          Reakcie čitateľov
        </div>
        <Link href="/reakcie" className="font-sans text-[11px] uppercase tracking-[0.22em] text-slate-200/70 transition-colors hover:text-white">
          Všetky reakcie
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-slate-200/74">Meno</span>
            <input
              required
              maxLength={120}
              value={formState.authorName}
              onChange={(event) => setFormState((prev) => ({ ...prev, authorName: event.target.value }))}
              className="rounded-lg border border-[rgba(111,231,255,0.18)] bg-[rgba(5,25,31,0.8)] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-(--accent)"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-slate-200/74">E-mail</span>
            <input
              required
              type="email"
              maxLength={190}
              value={formState.authorEmail}
              onChange={(event) => setFormState((prev) => ({ ...prev, authorEmail: event.target.value }))}
              className="rounded-lg border border-[rgba(111,231,255,0.18)] bg-[rgba(5,25,31,0.8)] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-(--accent)"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-slate-200/74">Web (voliteľné)</span>
          <input
            type="url"
            maxLength={255}
            value={formState.authorUrl}
            onChange={(event) => setFormState((prev) => ({ ...prev, authorUrl: event.target.value }))}
            className="rounded-lg border border-[rgba(111,231,255,0.18)] bg-[rgba(5,25,31,0.8)] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-(--accent)"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-slate-200/74">Komentár</span>
          <textarea
            required
            minLength={5}
            maxLength={4000}
            rows={5}
            value={formState.content}
            onChange={(event) => setFormState((prev) => ({ ...prev, content: event.target.value }))}
            className="rounded-lg border border-[rgba(111,231,255,0.18)] bg-[rgba(5,25,31,0.8)] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-(--accent)"
          />
        </label>

        <label className="sr-only" aria-hidden>
          Firemný názov
          <input
            tabIndex={-1}
            autoComplete="off"
            value={formState.company}
            onChange={(event) => setFormState((prev) => ({ ...prev, company: event.target.value }))}
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg border border-[rgba(111,231,255,0.22)] bg-[rgba(31,169,214,0.72)] px-5 py-3 font-sans text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-[rgba(31,169,214,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Odosielam..." : "Odoslať komentár"}
          </button>
          <span className="text-xs text-slate-300/70">
            Komentár sa zobrazí až po schválení redakciou.
          </span>
        </div>

        {submitMessage ? <p className="text-sm text-emerald-200/90">{submitMessage}</p> : null}
        {submitError ? <p className="text-sm text-rose-200/90">{submitError}</p> : null}
      </form>

      <div className="mt-8 space-y-4 border-t border-[rgba(111,231,255,0.12)] pt-6">
        <h3 className="font-serif text-2xl text-white">Schválené komentáre ({total})</h3>

        {isLoading ? (
          <p className="text-sm text-slate-300/74">Načítavam komentáre...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-300/74">Zatiaľ tu nie sú žiadne schválené komentáre.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <article key={comment.id} className="rounded-lg border border-[rgba(111,231,255,0.12)] bg-[rgba(4,21,28,0.74)] p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2 font-sans text-[11px] uppercase tracking-[0.2em] text-slate-300/68">
                  <span>{comment.authorName}</span>
                  <span className="h-1 w-1 rounded-full bg-(--accent)/70" />
                  <span>{comment.dateLabel}</span>
                </div>
                <div className="article-body text-sm leading-relaxed text-slate-100/84" dangerouslySetInnerHTML={{ __html: comment.contentHtml }} />
              </article>
            ))}
          </div>
        )}

        {loadError ? <p className="text-sm text-rose-200/90">{loadError}</p> : null}

        {hasMore ? (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="rounded-lg border border-[rgba(111,231,255,0.2)] px-4 py-2 font-sans text-xs uppercase tracking-[0.2em] text-white transition-colors hover:border-(--accent) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingMore ? "Načítavam..." : "Načítať ďalšie"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
