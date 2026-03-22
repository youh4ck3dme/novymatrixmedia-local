import Link from "next/link";
import FeaturedPost from "@/components/FeaturedPost";
import PostCard from "@/components/PostCard";
import SidebarFeed from "@/components/SidebarFeed";

import type { HomePageData } from "@/types/wordpress";

interface MatrixHeroProps {
  data: HomePageData;
}

export default function MatrixHero({ data }: MatrixHeroProps) {
  const currentDate = new Date().toLocaleDateString("sk-SK", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).toUpperCase();

  return (
    <div className="relative z-10 min-h-screen text-slate-100">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">

        <header className="overflow-hidden rounded-4xl border border-[rgba(111,231,255,0.2)] bg-[linear-gradient(180deg,rgba(7,55,67,0.88),rgba(7,32,40,0.86))] shadow-[0_0_40px_rgba(80,226,255,0.14)] backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 border-b border-[rgba(111,231,255,0.16)] px-5 py-4 sm:px-7">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(111,231,255,0.24)] bg-[rgba(8,49,60,0.8)] text-(--foreground) shadow-[0_0_20px_rgba(88,217,234,0.16)]">
                <span className="font-mono text-lg">::</span>
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-(--accent)">
                  Diskusia
                </div>
                <h1 className="truncate font-serif text-2xl font-semibold tracking-[0.12em] text-white sm:text-3xl">
                  Novy Matrix Media
                </h1>
              </div>
            </div>

            <Link
              href="https://t.me/novy_matrix_lm"
              className="shrink-0 rounded-full border border-[rgba(111,231,255,0.3)] bg-[rgba(13,84,102,0.58)] px-5 py-2 font-mono text-xs uppercase tracking-[0.28em] text-(--foreground) transition-all hover:bg-[rgba(31,169,214,0.78)] hover:text-white"
            >
              Odoberať
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-sm sm:px-7">
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-(--foreground)/82">
              <span className="rounded-full bg-[rgba(31,169,214,0.88)] px-4 py-2 text-white shadow-[0_0_20px_rgba(31,169,214,0.3)]">
                Vyberáme
              </span>
              <span className="text-(--foreground)/70">{currentDate}</span>
            </div>
            <nav className="flex flex-wrap items-center gap-5 font-mono text-[11px] uppercase tracking-[0.26em] text-(--foreground)/70">
              {data.navigationItems.map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  className={item.active ? "text-(--accent)" : "transition-colors hover:text-(--foreground)"}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

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
      </div>

      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(10,24,30,0)_52%,rgba(2,8,12,0.2)_52%),linear-gradient(90deg,rgba(84,221,244,0.04),rgba(9,121,143,0.02),rgba(178,243,255,0.05))] bg-size-[100%_2px,3px_100%] opacity-25" />
    </div>
  );
}
