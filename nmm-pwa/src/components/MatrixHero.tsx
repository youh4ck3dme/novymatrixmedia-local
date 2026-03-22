import Link from "next/link";

import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import SidebarFeed from "@/components/SidebarFeed";
import SiteHeader from "@/components/SiteHeader";

import { getEditorialReadinessLabel, getEditorialReadinessTone } from "@/lib/editorial-workflow";
import type { HomePageData } from "@/types/wordpress";

interface MatrixHeroProps {
  data: HomePageData;
}

export default function MatrixHero({ data }: MatrixHeroProps) {
  const ingestPosts = Array.from(
    new Map(
      [data.featuredPost, ...data.secondaryPosts, ...data.sidebarPosts]
        .filter((post) => post.ingestSource === "telegram")
        .map((post) => [post.id, post]),
    ).values(),
  );

  return (
    <div className="relative z-10 min-h-screen text-slate-100">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <SiteHeader navigationItems={data.navigationItems} />

        <main className="grid grid-cols-1 gap-8 py-8 lg:grid-cols-12">

          <div className="flex flex-col gap-8 lg:col-span-8">
            <FeaturedPost post={data.featuredPost} />

            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {data.secondaryPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </section>
          </div>

          <SidebarFeed posts={data.sidebarPosts} />

        </main>

        {ingestPosts.length > 0 ? (
          <section className="mt-2 rounded-xl border border-[rgba(111,231,255,0.07)] bg-[rgba(5,28,36,0.58)] p-6 shadow-[0_0_20px_rgba(80,226,255,0.01)] backdrop-blur-md">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(111,231,255,0.05)] pb-4">
              <div>
                <div className="font-sans text-[11px] uppercase tracking-[0.3em] text-(--accent)">Telegram ingest</div>
                <h2 className="mt-2 font-serif text-3xl text-white">Rýchlo importované texty čakajú na redakčné dotiahnutie.</h2>
              </div>
              <Link href="https://t.me/novy_matrix_lm" className="rounded-xl border border-[rgba(111,231,255,0.08)] px-4 py-3 font-sans text-xs uppercase tracking-[0.22em] text-slate-100/78 transition-colors hover:border-(--accent) hover:text-white">
                Otvoriť kanál
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ingestPosts.map((post) => (
                <article key={post.id} className="rounded-xl border border-[rgba(111,231,255,0.06)] bg-[rgba(5,32,40,0.52)] p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2 font-sans text-[11px] uppercase tracking-[0.22em] text-(--accent)">
                    <span>{post.categoryLabel}</span>
                    <span className="rounded-full border border-[rgba(111,231,255,0.12)] px-2 py-1 text-[10px] tracking-[0.18em] text-slate-100/78">Telegram ingest</span>
                    {getEditorialReadinessLabel(post.editorialReadiness) ? (
                      <span className={getEditorialReadinessTone(post.editorialReadiness) === "warning"
                        ? "rounded-full border border-[rgba(251,146,60,0.28)] px-2 py-1 text-[10px] tracking-[0.18em] text-orange-100/82"
                        : getEditorialReadinessTone(post.editorialReadiness) === "progress"
                          ? "rounded-full border border-[rgba(59,130,246,0.28)] px-2 py-1 text-[10px] tracking-[0.18em] text-sky-100/82"
                          : "rounded-full border border-[rgba(16,185,129,0.28)] px-2 py-1 text-[10px] tracking-[0.18em] text-emerald-100/82"}
                      >
                        {getEditorialReadinessLabel(post.editorialReadiness)}
                      </span>
                    ) : null}
                  </div>
                  <Link href={post.href} className="block font-serif text-2xl leading-tight text-white transition-colors hover:text-(--accent)">
                    {post.title}
                  </Link>
                  <p className="mt-3 text-sm leading-relaxed text-slate-200/72">{post.excerpt}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(10,24,30,0)_52%,rgba(2,8,12,0.2)_52%),linear-gradient(90deg,rgba(74,191,207,0.03),rgba(9,100,120,0.015),rgba(160,220,232,0.035))] bg-size-[100%_2px,3px_100%] opacity-16" />
    </div>
  );
}
