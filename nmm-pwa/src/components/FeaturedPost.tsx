import Image from "next/image";
import Link from "next/link";

import { getEditorialReadinessLabel, getEditorialReadinessTone } from "@/lib/editorial-workflow";
import type { SitePost } from "@/types/wordpress";

interface FeaturedPostProps {
  post: SitePost;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  const isTelegramIngest = post.ingestSource === "telegram";
  const featuredLabel = post.highlightBadge || "Featured";
  const editorialReadinessLabel = getEditorialReadinessLabel(post.editorialReadiness);
  const editorialReadinessTone = getEditorialReadinessTone(post.editorialReadiness);
  const editorialReadinessClassName = editorialReadinessTone === "warning"
    ? "rounded-full border border-[rgba(251,146,60,0.28)] px-3 py-1 text-orange-100/84"
    : editorialReadinessTone === "progress"
      ? "rounded-full border border-[rgba(59,130,246,0.28)] px-3 py-1 text-sky-100/84"
      : "rounded-full border border-[rgba(16,185,129,0.28)] px-3 py-1 text-emerald-100/84";

  return (
    <article className="group overflow-hidden rounded-xl border border-[rgba(111,231,255,0.08)] bg-[rgba(4,30,38,0.60)] md:shadow-[0_0_24px_rgba(80,226,255,0.02)] md:backdrop-blur-md">
      <div className="relative overflow-hidden border-b border-[rgba(111,231,255,0.07)]">
        <div className="relative h-80 w-full sm:h-112">
          <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(5,31,40,0.08),rgba(5,31,40,0.38))]" />
          <Image
            src={post.imageUrl}
            alt={post.imageAlt}
            fill
            priority
            fetchPriority="high"
            quality={65}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 820px"
            className="object-cover saturate-90 transition-all duration-700 group-hover:scale-[1.02]"
          />
        </div>
      </div>
      <div className="space-y-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3 font-sans text-xs uppercase tracking-[0.22em] text-(--foreground)/74">
          <span className="rounded-full bg-[rgba(26,149,190,0.72)] px-3 py-1 text-white">{post.categoryLabel}</span>
          <span>{post.sourceName || "Novy Matrix Media"}</span>
          <span className="text-(--accent)">{featuredLabel}</span>
          {post.articleType ? <span>{post.articleType}</span> : null}
          {post.estimatedReadingTime ? <span>{post.estimatedReadingTime}</span> : null}
          {isTelegramIngest ? <span className="rounded-full border border-[rgba(111,231,255,0.14)] px-3 py-1 text-(--accent)">Telegram ingest</span> : null}
          {editorialReadinessLabel ? <span className={editorialReadinessClassName}>{editorialReadinessLabel}</span> : null}
        </div>
        <Link href={post.href} className="block max-w-4xl font-serif text-3xl leading-[1.1] text-white transition-colors group-hover:text-(--accent) sm:text-5xl">
          {post.title}
        </Link>
        {post.subtitle ? (
          <p className="max-w-3xl text-lg leading-relaxed text-slate-100/80">
            {post.subtitle}
          </p>
        ) : null}
        <p className="max-w-3xl text-lg leading-relaxed text-slate-100/88">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-3 font-sans text-xs uppercase tracking-[0.25em] text-(--foreground)/76">
          <Link href="https://t.me/novy_matrix_lm" className="rounded-xl border border-[rgba(111,231,255,0.14)] bg-[rgba(6,42,52,0.62)] px-4 py-3 transition-colors hover:bg-[rgba(26,149,190,0.72)] hover:text-white">
            Odoberať novinky
          </Link>
          <Link href={post.href} className="rounded-xl border border-[rgba(111,231,255,0.08)] px-4 py-3 transition-colors hover:border-[rgba(111,231,255,0.22)] hover:text-white">
            Otvoriť článok
          </Link>
        </div>
      </div>
    </article>
  );
}
