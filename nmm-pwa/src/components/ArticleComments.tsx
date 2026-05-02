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
const FIELD_CLASS_NAME = "rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan-500/70";
const LABEL_CLASS_NAME = "font-sans text-[11px] uppercase tracking-[0.2em] text-slate-300";

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
    <section className="mx-auto mt-12 max-w-3xl rounded-lg border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <h2 className="font-sans text-[11px] uppercase tracking-[0.28em] text-cyan-400">Reakcie čitateľov</h2>
        <Link href="/reakcie" className="font-sans text-[11px] uppercase tracking-[0.22em] text-slate-300 transition-colors hover:text-white">
          Všetky reakcie
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={LABEL_CLASS_NAME}>Meno</span>
            <input
              required
              maxLength={120}
              value={formState.authorName}
              onChange={(event) => setFormState((prev) => ({ ...prev, authorName: event.target.value }))}
              className={FIELD_CLASS_NAME}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className={LABEL_CLASS_NAME}>E-mail</span>
            <input
              required
              type="email"
              maxLength={190}
              value={formState.authorEmail}
              onChange={(event) => setFormState((prev) => ({ ...prev, authorEmail: event.target.value }))}
              className={FIELD_CLASS_NAME}
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className={LABEL_CLASS_NAME}>Web (voliteľné)</span>
          <input
            type="url"
            maxLength={255}
            value={formState.authorUrl}
            onChange={(event) => setFormState((prev) => ({ ...prev, authorUrl: event.target.value }))}
            className={FIELD_CLASS_NAME}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={LABEL_CLASS_NAME}>Komentár</span>
          <textarea
            required
            minLength={5}
            maxLength={4000}
            rows={5}
            value={formState.content}
            onChange={(event) => setFormState((prev) => ({ ...prev, content: event.target.value }))}
            className={FIELD_CLASS_NAME}
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
            className="rounded-lg border border-cyan-500/50 bg-slate-900 px-5 py-3 font-sans text-xs uppercase tracking-[0.24em] text-cyan-300 transition-colors hover:border-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Odosielam..." : "Odoslať komentár"}
          </button>
          <span className="text-xs text-slate-400">Komentár sa zobrazí až po schválení redakciou.</span>
        </div>

        {submitMessage ? <p className="text-sm text-cyan-300">{submitMessage}</p> : null}
        {submitError ? <p className="text-sm text-blue-300">{submitError}</p> : null}
      </form>

      <section className="mt-8 space-y-4 border-t border-slate-800 pt-6">
        <h3 className="font-serif text-2xl text-white">Schválené komentáre ({total})</h3>

        {isLoading ? <p className="text-sm text-slate-300">Načítavam komentáre...</p> : null}
        {!isLoading && comments.length === 0 ? <p className="text-sm text-slate-300">Zatiaľ tu nie sú žiadne schválené komentáre.</p> : null}

        {!isLoading && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <article key={comment.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2 font-sans text-[11px] uppercase tracking-[0.2em] text-slate-300">
                  <span>{comment.authorName}</span>
                  <span className="h-1 w-1 rounded-full bg-cyan-400/80" />
                  <span>{comment.dateLabel}</span>
                </div>
                <div className="article-body text-sm leading-relaxed text-slate-100" dangerouslySetInnerHTML={{ __html: comment.contentHtml }} />
              </article>
            ))}
          </div>
        ) : null}

        {loadError ? <p className="text-sm text-blue-300">{loadError}</p> : null}

        {hasMore ? (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="rounded-lg border border-slate-700 px-4 py-2 font-sans text-xs uppercase tracking-[0.2em] text-slate-200 transition-colors hover:border-cyan-500/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingMore ? "Načítavam..." : "Načítať ďalšie"}
          </button>
        ) : null}
      </section>
    </section>
  );
}
