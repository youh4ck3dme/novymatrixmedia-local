import Image from "next/image";
import Link from "next/link";

import { getEditorialReadinessLabel, getEditorialReadinessTone } from "@/lib/editorial-workflow";
import { EXTERNAL_LINK_REL, TELEGRAM_CHANNEL_URL, YOUTUBE_CHANNEL_URL } from "@/lib/contact-links";
import { resolvePublicAuthor } from "@/lib/public-author";
import { resolveSourceAttribution } from "@/lib/source-attribution";
import type { SitePost } from "@/types/wordpress";

interface FeaturedPostProps {
  post: SitePost;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  const isTelegramIngest = post.ingestSource === "telegram";
  const featuredLabel = post.highlightBadge || "Featured";
  const editorialReadinessLabel = getEditorialReadinessLabel(post.editorialReadiness);
  const editorialReadinessTone = getEditorialReadinessTone(post.editorialReadiness);
  const sourceAttribution = resolveSourceAttribution(post);
  const publicAuthor = resolvePublicAuthor(post);
  const editorialReadinessClassName = editorialReadinessTone === "warning"
    ? "rounded-full border border-blue-600/35 px-3 py-1 text-slate-200"
    : editorialReadinessTone === "progress"
      ? "rounded-full border border-cyan-500/35 px-3 py-1 text-cyan-300"
      : "rounded-full border border-slate-700 px-3 py-1 text-slate-200";

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-800 bg-slate-900 md:backdrop-blur-md">
      <div className="relative overflow-hidden border-b border-slate-800">
        <div className="relative h-80 w-full sm:h-112">
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-950/10 to-slate-950/45" />
          <Image
            src={post.imageUrl}
            alt={post.imageAlt || post.title || "Ilustračný obrázok k článku"}
            fill
            priority
            fetchPriority="high"
            quality={92}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 820px"
            className="object-cover transition-all duration-700 group-hover:scale-[1.02]"
          />
        </div>
      </div>
      <div className="space-y-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3 font-sans text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <span className="rounded-full border border-cyan-500/30 bg-slate-900 px-3 py-1 text-cyan-400">{post.categoryLabel}</span>
          {publicAuthor ? <span>{publicAuthor.name}</span> : null}
          {sourceAttribution ? (
            sourceAttribution.url ? (
              <a href={sourceAttribution.url} target="_blank" rel={EXTERNAL_LINK_REL} className="text-cyan-400 transition-colors hover:text-white">
                Zdroj: {sourceAttribution.name}
              </a>
            ) : (
              <span className="text-cyan-400">Zdroj: {sourceAttribution.name}</span>
            )
          ) : null}
          <span className="text-cyan-400">{featuredLabel}</span>
          {post.articleType ? <span>{post.articleType}</span> : null}
          {post.estimatedReadingTime ? <span>{post.estimatedReadingTime}</span> : null}
          {isTelegramIngest ? <span className="rounded-full border border-slate-700 px-3 py-1 text-cyan-300">Telegram ingest</span> : null}
          {editorialReadinessLabel ? <span className={editorialReadinessClassName}>{editorialReadinessLabel}</span> : null}
        </div>
        <Link href={post.href} className="block max-w-4xl text-2xl font-bold leading-tight text-slate-200 transition-colors group-hover:text-cyan-400 sm:text-3xl">
          {post.title}
        </Link>
        {post.subtitle ? (
          <p className="max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-base">
            {post.subtitle}
          </p>
        ) : null}
        <p className="max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-base">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-3 font-sans text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel={EXTERNAL_LINK_REL}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 transition-colors hover:border-cyan-500/70 hover:text-white"
          >
            Telegram
          </a>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel={EXTERNAL_LINK_REL}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 transition-colors hover:border-cyan-500/70 hover:text-white"
          >
            YouTube
          </a>
          <Link href={post.href} className="rounded-xl border border-slate-700 px-4 py-3 transition-colors hover:border-cyan-500/70 hover:text-white">
            Otvoriť článok
          </Link>
        </div>
      </div>
    </article>
  );
}
