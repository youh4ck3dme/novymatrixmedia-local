import Link from "next/link";

import type { Metadata } from "next";

import SiteHeader from "@/components/SiteHeader";
import { getEditorialReadinessLabel, getEditorialReadinessTone } from "@/lib/editorial-workflow";
import { getCategoryPageData, getNavigationItems } from "@/lib/wp-queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Video | Nový Matrix Media",
  description: "Výber video príspevkov z Nový Matrix Media.",
  alternates: {
    canonical: "/video",
  },
};

function getReadinessBadgeClassName(readiness?: string): string {
  const tone = getEditorialReadinessTone(readiness);

  if (tone === "warning") {
    return "rounded-full border border-blue-600/35 px-2 py-1 text-[10px] tracking-[0.18em] text-slate-200";
  }

  if (tone === "progress") {
    return "rounded-full border border-cyan-500/35 px-2 py-1 text-[10px] tracking-[0.18em] text-cyan-300";
  }

  return "rounded-full border border-slate-700 px-2 py-1 text-[10px] tracking-[0.18em] text-slate-200";
}

export default async function VideoPage() {
  const categoryData = await getCategoryPageData("video");

  if (categoryData) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <SiteHeader navigationItems={categoryData.navigationItems} />
        <section className="rounded-lg border border-slate-700 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/50 backdrop-blur-md sm:p-8">
          <div className="mb-3 font-sans text-xs uppercase tracking-[0.32em] text-cyan-400">{categoryData.category.name}</div>
          <h1 className="font-serif text-4xl text-white sm:text-5xl">{categoryData.category.name}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-200/82">
            {categoryData.category.description || "Výber video príspevkov z Nový Matrix Media."}
          </p>
          {categoryData.posts.some((post) => post.ingestSource === "telegram") ? (
            <div className="mt-6 inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 font-sans text-[11px] uppercase tracking-[0.22em] text-cyan-400">
              Obsahuje Telegram ingest články
            </div>
          ) : null}
          {categoryData.posts.some((item) => item.editorialReadiness) ? (
            <div className="mt-3 inline-flex items-center rounded-lg border border-blue-600/35 px-4 py-2 font-sans text-[11px] uppercase tracking-[0.22em] text-slate-200">
              Obsahuje články v redakčnom workflow
            </div>
          ) : null}
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categoryData.posts.map((post) => (
            <article key={post.id} className="rounded-lg border border-slate-700 bg-slate-900/90 p-4 backdrop-blur-sm">
              <div className="mb-3 flex flex-wrap items-center gap-2 font-sans text-[10px] uppercase tracking-[0.2em] text-slate-300/68">
                <span>{post.publishedAt}</span>
                <span className="h-1 w-1 rounded-full bg-slate-500/70" />
                <span>{post.categoryLabel}</span>
                {post.ingestSource === "telegram" ? (
                  <span className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] tracking-[0.18em] text-slate-100/78">Telegram ingest</span>
                ) : null}
                {getEditorialReadinessLabel(post.editorialReadiness) ? (
                  <span className={getReadinessBadgeClassName(post.editorialReadiness)}>
                    {getEditorialReadinessLabel(post.editorialReadiness)}
                  </span>
                ) : null}
              </div>
              <Link href={post.href} className="block font-serif text-2xl leading-tight text-white transition-colors hover:text-cyan-400">
                {post.title}
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-slate-200/78">{post.excerpt}</p>
              <p className="mt-4 font-sans text-xs uppercase tracking-[0.2em] text-slate-300/60">{post.publishedAt}</p>
            </article>
          ))}
        </section>
      </main>
    );
  }

  const navigationItems = await getNavigationItems("video");

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <SiteHeader navigationItems={navigationItems} />
      <section className="rounded-lg border border-slate-700 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/50 backdrop-blur-md sm:p-8">
        <div className="mb-3 font-sans text-xs uppercase tracking-[0.32em] text-cyan-400">Video</div>
        <h1 className="font-serif text-4xl text-white sm:text-5xl">Video</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-200/82">
          Výber video príspevkov z Nový Matrix Media.
        </p>
      </section>
      <section className="mt-8 rounded-lg border border-slate-700 bg-slate-900/90 p-5 backdrop-blur-sm">
        <p className="text-sm leading-relaxed text-slate-200/74">Zatiaľ nie sú dostupné žiadne video príspevky.</p>
      </section>
    </main>
  );
}
