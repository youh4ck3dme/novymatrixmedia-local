import Link from "next/link";

import type { SitePost } from "@/types/wordpress";

interface FeaturedPostProps {
  post: SitePost;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <article className="group overflow-hidden rounded-4xl border border-[rgba(111,231,255,0.2)] bg-[rgba(5,36,44,0.72)] shadow-[0_0_40px_rgba(80,226,255,0.08)] backdrop-blur-md">
      <div className="relative overflow-hidden border-b border-[rgba(111,231,255,0.18)]">
        <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(5,31,40,0.08),rgba(5,31,40,0.38))]" />
        <img
          src={post.imageUrl}
          alt={post.imageAlt}
          className="h-80 w-full object-cover saturate-90 transition-all duration-700 group-hover:scale-[1.02] sm:h-112"
        />
      </div>
      <div className="space-y-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-(--foreground)/74">
          <span className="rounded-full bg-[rgba(31,169,214,0.92)] px-3 py-1 text-white">{post.categoryLabel}</span>
          <span>Novy Matrix Media</span>
          <span className="text-(--accent)">Featured</span>
        </div>
        <Link href={post.href} className="block max-w-4xl font-serif text-3xl leading-[1.1] text-white transition-colors group-hover:text-(--accent) sm:text-5xl">
          {post.title}
        </Link>
        <p className="max-w-3xl text-lg leading-relaxed text-slate-200/84">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-3 font-mono text-xs uppercase tracking-[0.25em] text-(--foreground)/76">
          <Link href="https://t.me/novy_matrix_lm" className="rounded-full border border-[rgba(111,231,255,0.28)] bg-[rgba(8,49,60,0.72)] px-4 py-3 transition-colors hover:bg-[rgba(31,169,214,0.72)] hover:text-white">
            Odoberať novinky
          </Link>
          <Link href={post.href} className="rounded-full border border-[rgba(111,231,255,0.18)] px-4 py-3 transition-colors hover:border-[rgba(111,231,255,0.34)] hover:text-white">
            Otvoriť článok
          </Link>
        </div>
      </div>
    </article>
  );
}