import Link from "next/link";

import type { Metadata } from "next";

import SiteHeader from "@/components/SiteHeader";
import { getApprovedCommentsPage, getNavigationItems } from "@/lib/wp-queries";

interface ReakciePageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reakcie čitateľov | Nový Matrix Media",
  description: "Najnovšie schválené komentáre čitateľov naprieč článkami Nový Matrix Media.",
  alternates: {
    canonical: "/reakcie",
  },
};

function parsePage(value?: string): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function buildPageHref(page: number): string {
  return page <= 1 ? "/reakcie" : `/reakcie?page=${page}`;
}

export default async function ReakciePage({ searchParams }: ReakciePageProps) {
  const { page } = await searchParams;
  const requestedPage = parsePage(page);

  const [navigationItems, commentsData] = await Promise.all([
    getNavigationItems("home"),
    getApprovedCommentsPage({ page: requestedPage, perPage: 20 }),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <SiteHeader navigationItems={navigationItems} />

      <section className="rounded-lg border border-[rgba(111,231,255,0.2)] bg-[rgba(5,36,44,0.72)] p-6 shadow-[0_0_40px_rgba(80,226,255,0.08)] backdrop-blur-md sm:p-8">
        <div className="mb-3 font-sans text-xs uppercase tracking-[0.32em] text-(--accent)">Reakcie čitateľov</div>
        <h1 className="font-serif text-4xl text-white sm:text-5xl">Schválené komentáre naprieč webom</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-200/82">
          Na tejto stránke sa zobrazujú iba komentáre, ktoré prešli manuálnym schválením v redakcii.
        </p>
      </section>

      <section className="mt-8 rounded-lg border border-[rgba(111,231,255,0.16)] bg-[rgba(7,39,48,0.68)] p-5 backdrop-blur-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(111,231,255,0.12)] pb-4">
          <div className="font-sans text-[11px] uppercase tracking-[0.26em] text-(--accent)">
            {commentsData.total} schválených komentárov
          </div>
          <div className="font-sans text-[11px] uppercase tracking-[0.22em] text-slate-200/64">
            Strana {commentsData.page}{commentsData.totalPages > 0 ? ` / ${commentsData.totalPages}` : ""}
          </div>
        </div>

        {commentsData.comments.length === 0 ? (
          <p className="text-sm leading-relaxed text-slate-200/74">
            Zatiaľ tu nie sú žiadne schválené komentáre.
          </p>
        ) : (
          <div className="space-y-4">
            {commentsData.comments.map((comment) => (
              <article key={comment.id} className="rounded-lg border border-[rgba(111,231,255,0.12)] bg-[rgba(4,21,28,0.74)] p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2 font-sans text-[11px] uppercase tracking-[0.2em] text-slate-300/68">
                  {comment.authorUrl ? (
                    <a href={comment.authorUrl} target="_blank" rel="noreferrer noopener" className="transition-colors hover:text-white">
                      {comment.authorName}
                    </a>
                  ) : (
                    <span>{comment.authorName}</span>
                  )}
                  <span className="h-1 w-1 rounded-full bg-(--accent)/70" />
                  <span>{comment.dateLabel}</span>
                </div>
                <p className="text-base leading-relaxed text-slate-100/86">{comment.excerpt}</p>
                {comment.postHref ? (
                  <div className="mt-3 border-t border-[rgba(111,231,255,0.08)] pt-3 font-sans text-[11px] uppercase tracking-[0.2em] text-slate-300/70">
                    K článku:{" "}
                    <Link href={comment.postHref} className="text-(--accent) transition-colors hover:text-white">
                      {comment.postTitle || "Otvoriť článok"}
                    </Link>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}

        {commentsData.totalPages > 1 ? (
          <nav aria-label="Stránkovanie komentárov" className="mt-6 flex flex-wrap gap-3 border-t border-[rgba(111,231,255,0.12)] pt-5">
            {commentsData.hasPrevPage ? (
              <Link href={buildPageHref(commentsData.page - 1)} className="rounded-lg border border-[rgba(111,231,255,0.2)] px-4 py-2 font-sans text-xs uppercase tracking-[0.2em] text-white transition-colors hover:border-(--accent)">
                Novšie
              </Link>
            ) : null}
            {commentsData.hasNextPage ? (
              <Link href={buildPageHref(commentsData.page + 1)} className="rounded-lg border border-[rgba(111,231,255,0.2)] px-4 py-2 font-sans text-xs uppercase tracking-[0.2em] text-white transition-colors hover:border-(--accent)">
                Staršie
              </Link>
            ) : null}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
