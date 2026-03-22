import Link from "next/link";

import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import SidebarFeed from "@/components/SidebarFeed";
import SiteHeader from "@/components/SiteHeader";

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
          <section className="mt-2 rounded-4xl border border-[rgba(111,231,255,0.18)] bg-[rgba(6,34,42,0.66)] p-6 shadow-[0_0_40px_rgba(80,226,255,0.04)] backdrop-blur-md">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(111,231,255,0.12)] pb-4">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-(--accent)">Telegram ingest</div>
                <h2 className="mt-2 font-serif text-3xl text-white">Rýchlo importované texty čakajú na redakčné dotiahnutie.</h2>
              </div>
              <Link href="https://t.me/novy_matrix_lm" className="rounded-full border border-[rgba(111,231,255,0.2)] px-4 py-3 font-mono text-xs uppercase tracking-[0.22em] text-slate-100/78 transition-colors hover:border-(--accent) hover:text-white">
                Otvoriť kanál
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ingestPosts.map((post) => (
                <article key={post.id} className="rounded-3xl border border-[rgba(111,231,255,0.14)] bg-[rgba(7,39,48,0.62)] p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-(--accent)">
                    <span>{post.categoryLabel}</span>
                    <span className="rounded-full border border-[rgba(111,231,255,0.22)] px-2 py-1 text-[10px] tracking-[0.18em] text-slate-100/78">Telegram ingest</span>
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

      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(10,24,30,0)_52%,rgba(2,8,12,0.2)_52%),linear-gradient(90deg,rgba(84,221,244,0.04),rgba(9,121,143,0.02),rgba(178,243,255,0.05))] bg-size-[100%_2px,3px_100%] opacity-25" />
    </div>
  );
}
